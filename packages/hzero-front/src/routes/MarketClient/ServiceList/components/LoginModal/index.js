import React from 'react';
import { Form, Icon, Modal, Input, notification } from 'hzero-ui';
import { CLIENT_JUMP_URL } from 'utils/market-client';
import { getResponse } from 'utils/utils';
import styles from './index.less';

const MARKET_USER_INFO_KEY = '__market_user_info_';

function LoginModal({ loginModalVisible, onCancel, marketUserLogin, form }) {
  const { getFieldDecorator, validateFields } = form;

  const _onOk = () => {
    validateFields((err, v) => {
      if (err) return;

      const values = { ...v, password: btoa(v.password) };
      const saveData = Object.keys(values).reduce((pre, next) => {
        return [...pre, `${next}=${values[next]}`];
      }, []);

      // 密码需要 base64 一下，模拟表单提交
      marketUserLogin(saveData.join('&'), (res) => {
        if (getResponse(res)) {
          sessionStorage.setItem(MARKET_USER_INFO_KEY, JSON.stringify(res));
          if (onCancel) onCancel();
          notification.success({ message: '登录成功' });
        }
      });
    });
  };

  // 回车键登录
  const quickSearch = (e) => {
    if (e && e.keyCode === 13) {
      _onOk();
    }
  };

  return (
    <Modal
      title="请使用开放平台账号登录"
      visible={loginModalVisible}
      onOk={_onOk}
      okText="登录"
      onCancel={onCancel}
    >
      <div className={styles['header-desc']}>
        使用开放平台账号登录后，我们将帮您获取最新版本服务信息并进行版本对比。
      </div>
      <Form
        style={{ width: '80%', margin: '0 auto' }}
        layout="horizontal"
        onKeyDown={(e) => quickSearch(e)}
      >
        <Form.Item>
          {getFieldDecorator('userName', {
            rules: [{ required: true, message: '请输入邮箱/手机号账号' }],
          })(
            <Input
              size="large"
              prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="请输入邮箱/手机号账号"
            />
          )}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator('password', {
            rules: [{ required: true, message: '请输入登录密码' }],
          })(
            <Input
              size="large"
              prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
              type="password"
              placeholder="请输入登录密码"
            />
          )}
        </Form.Item>
        <Form.Item>
          <div className={styles['footer-operation']}>
            <div>
              <a href={`${CLIENT_JUMP_URL}/user/forget`} target="_blank" rel="noopener noreferrer">
                忘记密码
              </a>
            </div>
            <div>
              <a
                href={`${CLIENT_JUMP_URL}/user/register`}
                target="_blank"
                rel="noopener noreferrer"
              >
                我要注册
              </a>
            </div>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default Form.create({ fieldNameProp: null })(LoginModal);
