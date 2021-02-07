/**
 * 监听 theme 的 修改
 *
 */
import React from 'react';
import { connect } from 'dva';
import useThemeHelper from '@hzero-front-ui/cfg/lib/components/Container/useThemeHelper';

import { getEnvConfig } from 'utils/iocUtils';

const { MULTIPLE_SKIN_ENABLE } = getEnvConfig();

let ued = false;
try {
  ued = MULTIPLE_SKIN_ENABLE ? JSON.parse(MULTIPLE_SKIN_ENABLE) : false;
} catch (e) {
  ued = false;
}
class DefaultListenTheme extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (ued) {
      const nextState = {};
      const { setTheme = (e) => e, schema, menuLayoutTheme } = nextProps;
      nextState.menuLayoutTheme = menuLayoutTheme;
      if (prevState.menuLayoutTheme !== menuLayoutTheme) {
        const themeConfigCurrent = localStorage.getItem('themeConfigCurrent');
        if (!themeConfigCurrent && setTheme) {
          const { readOriginLocalTheme, setLocalTheme } = useThemeHelper();
          const localTheme = readOriginLocalTheme();
          const schemaCurrent = localTheme[menuLayoutTheme]?.current || localTheme[schema]?.current;
          localStorage.setItem(
            'themeConfigCurrent',
            localTheme[menuLayoutTheme]?.current ? menuLayoutTheme : schema
          );
          setLocalTheme({
            current: {
              ...schemaCurrent,
              schema: localTheme[menuLayoutTheme]?.current ? menuLayoutTheme : schema,
            },
            prev: {},
          });
          setTheme({
            current: {
              ...schemaCurrent,
              schema: localTheme[menuLayoutTheme]?.current ? menuLayoutTheme : schema,
            },
            prev: {},
          });
        }
      }
      return nextState;
    }
  }

  render() {
    return null;
  }
}

export default connect(({ user = {} }) => ({
  menuLayoutTheme: (user.currentUser || {}).menuLayoutTheme,
}))(DefaultListenTheme);
