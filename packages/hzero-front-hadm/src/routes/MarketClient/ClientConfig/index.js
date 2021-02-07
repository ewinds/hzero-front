import React, { useEffect, useState } from 'react';
import { Content } from 'components/Page';
import { Row, Col, Switch, Input, Button, Icon } from 'hzero-ui';
import notification from 'utils/notification';
import AppStoreIcon from '../../../assets/market/appstore.svg';
import PlanIcon from '../../../assets/market/plan.svg';
import UserTermsModal from './components/UserTermsModal';
import { queryMarketConfig, saveMarketConfig } from './services';
import styles from './index.less';

const KEY_MARKET_ENTER = 'KEY_MARKET_ENTER';
const KEY_PLAN = 'KEY_PLAN';

export default function ClientConfig() {
  const [marketConfig, setMarketConfig] = useState({});
  const [switchLoading, setSwitchLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [companyName, setCompanyName] = useState('');
  useEffect(() => {
    queryMarketConfig().then((res) => {
      if (res) {
        setMarketConfig(res);
        setCompanyName(res.companyName);
      }
    });
  }, []);

  // 处理市场按钮变更
  const handleMarketEnterChange = (val) => {
    saveConfig({ ...marketConfig, iconFlag: val }, KEY_MARKET_ENTER);
  };

  // 处理是否同意计划变更
  const handleRuleChange = (val) => {
    saveConfig({ ...marketConfig, joinFlag: val }, KEY_PLAN);
  };

  // 保存认证企业名称
  const handleSaveCompanyName = () => {
    saveConfig({ ...marketConfig, companyName });
    setIsEditing(false);
  };

  // 处理清空按钮
  const handleCancelButton = () => {
    setIsEditing(false);
    setCompanyName(marketConfig.companyName);
  };

  // 保存客户端配置数据
  const saveConfig = (data, loadingKey, cb) => {
    setSwitchLoading(loadingKey);
    saveMarketConfig(data).then((res) => {
      if (res) {
        setMarketConfig(res);
        setSwitchLoading(false);
        notification.success({ message: '操作成功' });
        if (typeof cb === 'function') cb(data);
      }
    });
  };

  // 渲染按钮
  const renderEnterEnable = ({
    key,
    initVal,
    handleChange,
    openText = '开启',
    closeText = '关闭',
  }) => {
    return (
      <>
        <h3 className={styles['switch-text']}>{initVal ? openText : closeText}</h3>
        <Switch
          loading={switchLoading === key}
          checked={initVal}
          onChange={(val) => handleChange && handleChange(val)}
        />
      </>
    );
  };

  // 渲染顶部公司信息维护按钮
  const renderCompanyNameUI = () => {
    return (
      <div className={styles['company-wrap']}>
        <h3 className={styles['header-text']}>企业认证：</h3>
        {isEditing ? (
          <div className={styles['edit-wrap']}>
            <Input
              onChange={(val) => setCompanyName(val.target.value)}
              value={companyName}
              style={{ width: '300px', marginRight: '12px' }}
              placeholder="请输入认证企业名称"
            />
            <Button style={{ marginRight: '12px' }} onClick={handleCancelButton}>
              取消
            </Button>
            <Button type="primary" onClick={handleSaveCompanyName}>
              保存
            </Button>
          </div>
        ) : (
          <>
            {marketConfig?.companyName ? (
              <a>{marketConfig.companyName}</a>
            ) : (
              <span onClick={() => setIsEditing(true)} style={{ color: '#999' }}>
                维护认证企业名称
              </span>
            )}
            <Icon
              style={{ color: '#999', marginLeft: '7px', fontSize: '14px' }}
              onClick={() => setIsEditing(true)}
              type="edit"
            />
          </>
        )}
      </div>
    );
  };

  const renderData = [
    [
      KEY_MARKET_ENTER,
      AppStoreIcon,
      [
        [
          <h3>应用市场入口</h3>,
          renderEnterEnable({
            initVal: marketConfig.iconFlag,
            handleChange: handleMarketEnterChange,
            openText: '开启',
            closeText: '禁用',
            key: KEY_MARKET_ENTER,
          }),
        ],
        [
          <span style={{ color: '#5A6677' }}>快速浏览产品、服务、组件，支持版本对比</span>,
          <span style={{ color: '#5A6677' }}>
            {marketConfig.iconFlag
              ? '关闭后，应用市场入口将不会在顶部导航中展示'
              : '打开后，系统管理员可通过顶部应用市场图标进入应用市场'}
          </span>,
        ],
      ],
    ],
    [
      KEY_PLAN,
      PlanIcon,
      [
        [
          <h3 onClick={() => setVisible(!visible)}>
            <a>《Hzero产品体验改进计划》</a>
          </h3>,
          renderEnterEnable({
            initVal: marketConfig.joinFlag,
            handleChange: handleRuleChange,
            openText: '同意',
            closeText: '不同意',
            key: KEY_PLAN,
          }),
        ],
        [
          <span style={{ color: '#5A6677' }}>我们持续优化Hzero产品，为您提供更好的服务</span>,
          <span style={{ color: '#5A6677' }}>
            {marketConfig.joinFlag
              ? '若您不同意，我们将不会收集您的本地环境运行信息，同时也无法为您提供版本对比服务'
              : '若您同意，我们将为您提供本地服务版本对比服务'}
          </span>,
        ],
      ],
    ],
  ];

  // 渲染配置列表
  const renderConfigItem = (item) => {
    const [key, icon, children = []] = item;
    return (
      <Row key={key} type="flex" className={styles['config-item']}>
        <Col>
          <img src={icon} alt="" />
        </Col>
        <Col className={styles['config-item-right']}>
          {children.map((o) => {
            const [left, right] = o;
            return (
              <Row type="flex">
                <Col className={styles.left}>{left}</Col>
                <Col className={styles.right}>{right}</Col>
              </Row>
            );
          })}
        </Col>
      </Row>
    );
  };

  return (
    <Content>
      {renderCompanyNameUI()}
      <div className={styles['config-wrap']}>{renderData.map((o) => renderConfigItem(o))}</div>
      <UserTermsModal visible={visible} editAble={false} handleCancel={() => setVisible(false)} />
    </Content>
  );
}
