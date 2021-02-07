import React, { useEffect, useState } from 'react';
import { connect } from 'dva';
import { getResponse } from 'utils/utils';
import { Link, routerRedux } from 'dva/router';
import { Table, Row, Col, Icon, notification, Tooltip } from 'hzero-ui';
import { Content, Header } from 'components/Page';

import CompareButton from './components/CompareButton';
import VersionModal from './components/VersionModal';
import LoginModal from './components/LoginModal';
import {
  fetchServiceList,
  queryHzeroVersion,
  queryServiceVersionList,
  testConnect,
  marketUserLogin,
} from './services';
import styles from './index.less';

const MARKET_USER_INFO_KEY = '__market_user_info_';
const BACK_TO_HOME_URL = '/market-client/home';

function ServerList({ dispatch }) {
  const [serviceList, setServiceList] = useState([]);
  const [serviceListLoading, setHzeroVersionLoading] = useState(false);
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [hzeroVersion, setHzeroVersion] = useState([]);
  const [menuList, setMenuList] = useState([]);
  const [versionLoadingId, setVersionLoadingId] = useState('');
  const [menuVisibleId, setMenuVisibleId] = useState('');
  const [compareModalData, setCompareModalData] = useState(null);
  const [reachAble, setReachAble] = useState(false);
  useEffect(() => {
    init();
    return () => {
      document.body.onclick = null;
    };
  }, []);

  // 初始化方法
  const init = async () => {
    setHzeroVersionLoading(true);
    // 查询服务列表
    fetchServiceList().then((res) => {
      setHzeroVersionLoading(false);
      if (Array.isArray(res)) {
        setServiceList(handleServerList(res));
      }
    });

    // 查询 Hzero 版本
    queryHzeroVersion().then((res) => {
      if (res) {
        setHzeroVersion(res);
      }
    });

    // 查询对比的后端是否是通的
    testConnect().then((connectRes) => {
      if (connectRes && connectRes.flag === true) {
        setReachAble(true);
      } else {
        // 网络链接不通，不能用服务对比
        setReachAble(false);
      }
    });
  };

  // 跳转离线页面
  // TODO 跳转空页面，下个迭代做，这个迭代不能用，置灰即可
  // eslint-disable-next-line
  const goToOfflinePage = () => {
    dispatch(
      routerRedux.push({
        pathname: '/market-client/offline',
      })
    );
  };

  // 判断是否登录
  const checkLoginStatus = () => {
    try {
      const userInfo = JSON.parse(sessionStorage.getItem(MARKET_USER_INFO_KEY)) || {};
      return userInfo.realName;
    } catch (e) {
      return false;
    }
  };

  // 打开登录模态框
  const openLoginModal = () => {
    setLoginModalVisible(true);
  };

  // 清空页面全局点击事件
  const clearMenuEvent = () => {
    setMenuVisibleId('');
    setVersionLoadingId('');
    setMenuList([]);
    document.body.onclick = null;
  };

  // 处理数据服务列表数据接口返回结果
  const handleServerList = (res) => {
    return res.map((item) => {
      const { components, servers } = item;
      const itemRes = { ...item };
      if (Array.isArray(servers) && servers.length > 1) {
        // 由多个服务, 需要展示子元素
        itemRes.children = servers.map((i) => ({ ...i, expendChilde: true }));
      } else {
        // 只有一个服务，任意从 components, servers 中拿出一个版本
        const tempVersionItem = servers[0] || components[0];
        Object.assign(itemRes, {
          currentVersion: tempVersionItem.version,
          groupId: tempVersionItem.groupId,
          artifactId: tempVersionItem.artifactId,
        });
      }
      return itemRes;
    });
  };

  // 处理版本按钮显示/隐藏
  const handleVisibleChange = (visible, record) => {
    if (!reachAble) {
      // goToOfflinePage();
      return;
    }
    if (!checkLoginStatus()) {
      openLoginModal();
      return;
    }

    if (visible) {
      document.body.onclick = clearMenuEvent;
      setVersionLoadingId(record.serviceId);
      const { artifactId, groupId } = record;

      // 查询版本号
      queryServiceVersionList({ artifactId, groupId }).then((res) => {
        setVersionLoadingId('');
        if (getResponse(res)) {
          setMenuVisibleId(record.serviceId);
          setMenuList(res); // 把查询回来的版本回写到页面中
        }
      });
    }
  };

  // 表格列公共渲染函数
  const columCommonRender = (text, record) => {
    const obj = {
      children: text || '-',
      props: {},
    };
    if (record.expendChilde) {
      obj.props.colSpan = 0;
    }
    return obj;
  };

  // 服务名称表格列渲染函数
  const serviceNameColumnRender = (text, record) => {
    const obj = {
      children: text,
      props: {},
    };
    if (record.expendChilde) {
      // 渲染展开行
      obj.props.colSpan = 5;
      const { groupId, artifactId, version } = record;
      obj.children = (
        <div className={styles['service-name-render']}>
          <Row className={styles['service-name-item']} type="flex">
            <Col>
              <span>groupId：{groupId}</span>
              <br />
              <span>artifactId：{artifactId}</span>
            </Col>
            <Col>当前版本：{version}</Col>
          </Row>
        </div>
      );
    }
    return obj;
  };

  // 多服务版本对比
  const handleMultipleCompare = (record) => {
    if (!reachAble) {
      // goToOfflinePage();
      return;
    }
    if (!checkLoginStatus()) {
      openLoginModal();
      return;
    }

    if (!record || !Array.isArray(record.servers) || !record.servers.length) {
      notification.warning({ message: '暂无对比版本' });
      return;
    }
    setCompareModalData(record);
  };

  // 对版本对比文字按钮入口
  const multipleCompareEnter = (record) => {
    if (!reachAble) {
      return (
        <Tooltip title="无网络连接，在线对比功能不可用">
          <span style={{ color: '#999', cursor: 'not-allowed' }}>
            版本对比 <Icon type="down" />
          </span>
        </Tooltip>
      );
    }

    return <a onClick={() => handleMultipleCompare(record)}>版本对比</a>;
  };

  // 表格操作列
  const operationRender = (text, record) => {
    const child = (hasChildren) => {
      const temp =
        versionLoadingId === record.serviceId ? (
          <span style={{ marginLeft: '16px' }}>
            <Icon type="loading" />
          </span>
        ) : (
          <CompareButton
            record={record}
            reachAble={reachAble}
            menuList={menuList}
            menuVisibleId={menuVisibleId}
            handleVisibleChange={handleVisibleChange}
          />
        );
      const compare = hasChildren ? multipleCompareEnter(record) : temp;

      return (
        <>
          <Link to={`/market-client/services-detail/${record.serviceId}`}>组件列表</Link>
          &nbsp; &nbsp;
          {compare}
        </>
      );
    };

    const obj = {
      children: child(record.children && record.children.length),
      props: {},
    };
    if (record.expendChilde) {
      obj.props.colSpan = 0;
    }
    return obj;
  };

  const columns = [
    {
      title: '服务名称',
      dataIndex: 'serviceName',
      width: 250,
      render: serviceNameColumnRender,
    },
    {
      title: '服务编码',
      dataIndex: 'serviceId',
      render: columCommonRender,
    },
    {
      title: '当前版本',
      width: 200,
      dataIndex: 'currentVersion',
      render: columCommonRender,
    },
    {
      title: '操作',
      width: 210,
      dataIndex: 'operation',
      render: operationRender,
    },
  ];
  const tableProps = {
    indentSize: 0,
    bordered: true,
    rowKey: 'serviceId',
    dataSource: serviceList,
    loading: serviceListLoading,
    pagination: false,
    columns,
  };

  return (
    <>
      <Header title="服务列表" backPath={BACK_TO_HOME_URL} />
      <Content>
        <h3 className={styles['header-text']}>
          当前您使用的是{' '}
          <a>HZERO微服务技术平台{hzeroVersion.length ? ` v${hzeroVersion.join(', v')}` : null}</a>{' '}
          ，您使用的服务有：
        </h3>
        <Table {...tableProps} />
        <VersionModal
          handleCancel={() => setCompareModalData(null)}
          serviceData={compareModalData}
        />
        <LoginModal
          marketUserLogin={marketUserLogin}
          loginModalVisible={loginModalVisible}
          onCancel={() => setLoginModalVisible(false)}
        />
      </Content>
    </>
  );
}

export default connect()(ServerList);
