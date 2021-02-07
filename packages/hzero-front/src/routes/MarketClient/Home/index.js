import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Button, Radio, Icon, Modal, Tooltip, notification } from 'hzero-ui';
import { Content } from 'components/Page';

import HomeLogoText from '../../../assets/market/market-logo-text.svg';
import HomeBackground from '../../../assets/market/market-home-bg.png';
import UserTermsModal from './components/UserTermsModal';
import {
  queryMarketConfig,
  saveMarketConfig,
  getMarketUserInfo,
  marketUserLogout,
} from './services';
import styles from './index.less';

let IsSave = false; // 是否需要保存用户收集的数据
const MARKET_USER_INFO_KEY = '__market_user_info_';
const PRODUCT_LIST_JUMP_URL = '/market-client/product-list';
const SERVICE_LIST_JUMP_URL = '/market-client/services-list';

function MarketHome({ dispatch }) {
  const [loading, setLoading] = useState(false);
  const [marketUserInfo, serMarketUserInfo] = useState({});
  const [marketConfig, setMarketConfig] = useState({});
  const [isAgree, setIsAgree] = useState(false);
  const [isShowIcon, setIsShowIcon] = useState(false);
  const [ruleModalVisible, setRuleModalVisible] = useState(false);
  useEffect(() => {
    init();
  }, []);

  // 初始化数据
  const init = async () => {
    setLoading(true);
    queryMarketConfig().then((res) => {
      setLoading(false);
      if (res) {
        setMarketConfig(res);

        /**
         * 1.第一次 进来 joinFlag 没有值；直接弹出模态框
         * 2.joinFlag = false 不同意收集，展示操作按钮
         * 3.joinFlag = true 同意收集。不展示操作按钮
         */
        if (typeof res.joinFlag === 'boolean') {
          setIsAgree(res.joinFlag);
        } else if (!res.joinFlag && res.joinFlag !== false) {
          setRuleModalVisible(true);
          setIsAgree(true);
        }
        setIsShowIcon(res.joinFlag !== true);
      }
    });

    // 默默获取一次用户信息
    getMarketUserInfo((res) => {
      if (res) {
        serMarketUserInfo(res);
      }
      sessionStorage.setItem(MARKET_USER_INFO_KEY, JSON.stringify(res || ''));
    });
  };

  // 保存用户条款结果
  const saveRuleResult = () => {
    if (IsSave) {
      IsSave = false;
      saveMarketConfig({ ...marketConfig, joinFlag: isAgree });
    }
  };

  // 去产品列表或服务列表
  const handleClickJump = (url) => {
    saveRuleResult();
    dispatch(
      routerRedux.push({
        pathname: url,
      })
    );
  };

  // radio 按钮值改变
  const handleRadioChange = () => {
    setIsAgree(!isAgree);
    IsSave = true;
  };

  // 模态框的条款值改变
  const handleRuleModalResult = (boo) => {
    setRuleModalVisible(false);
    setIsAgree(boo);
    IsSave = true;
  };

  // 退出确认
  const logoutConfirmModal = () => {
    Modal.confirm({
      title: '确认退出登录？',
      content: '退出后，我们将无法帮您获取最新版本产品、服务信息。',
      onOk() {
        marketUserLogout().then((res) => {
          if (res) {
            sessionStorage.setItem(MARKET_USER_INFO_KEY, '');
            serMarketUserInfo({});
            notification.success({ message: '操作成功' });
          }
        });
      },
      onCancel() {},
    });
  };

  // 判断是否显示 ’我同意‘ 按钮
  const isShowAgreeRule = () => {
    if (marketConfig && typeof marketConfig.joinFlag === 'boolean') {
      return !marketConfig.joinFlag;
    }
    return true;
  };

  return (
    <Content style={{ position: 'relative' }}>
      <div className={styles['market-home-page']}>
        <div className={styles['logo-wrap']}>
          <img src={HomeLogoText} alt="" />
        </div>
        <h1>
          <a>
            {marketUserInfo?.realName ? <span>{marketUserInfo.realName}，</span> : null}
            <span>欢迎来到应用市场！</span>
          </a>
          {marketUserInfo?.realName ? (
            <Tooltip placement="top" title="退出登录">
              <span style={{ cursor: 'pointer', fontSize: '16px' }} onClick={logoutConfirmModal}>
                <Icon type="logout" />
              </span>
            </Tooltip>
          ) : null}
        </h1>
        <h2>企业级应用产品一体化采购平台 为企业数字化转型助力</h2>
        <p>
          <span>为了完善产品，避免缺陷，改善产品的用户体验，</span>
          <span>我们需要采集部分环境数据（包括本地产品版本、服务版本、崩溃日志等），</span>
          <span>汇总后统计这些数据以持续不断地提升产品的操作体验、运行性能。</span>
          <br />
          <span>请您仔细阅读</span>
          <a onClick={() => setRuleModalVisible(true)}>《HZERO用户体验改进计划》</a>
          <span>
            的具体内容，如果您不愿意加入该计划，取消选中“我同意加入《HZERO用户体验改进计划》”即可。
          </span>
        </p>
        {isShowIcon ? (
          <div>
            <Radio checked={isAgree} onClick={handleRadioChange} />
            <a onClick={() => setRuleModalVisible(true)}>我同意加入《HZERO用户体验改进计划》</a>
          </div>
        ) : null}
        <div className={styles['btn-wrap']}>
          <Button
            type="primary"
            size="large"
            disabled={loading}
            onClick={() => handleClickJump(PRODUCT_LIST_JUMP_URL)}
          >
            产品列表
          </Button>
          <Button
            type="default"
            size="large"
            disabled={loading}
            onClick={() => handleClickJump(SERVICE_LIST_JUMP_URL)}
          >
            已有服务
          </Button>
        </div>
      </div>
      <UserTermsModal
        visible={ruleModalVisible}
        editAble={isShowAgreeRule()}
        handleAgree={() => handleRuleModalResult(true)}
        handleDisagree={() => handleRuleModalResult(false)}
        handleCancel={() => setRuleModalVisible(false)}
      />
      <div className={styles['home-background']}>
        <img src={HomeBackground} alt="" />
      </div>
    </Content>
  );
}

export default connect()(MarketHome);
