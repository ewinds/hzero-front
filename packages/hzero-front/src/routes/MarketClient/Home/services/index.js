import request from 'utils/request';
import fetch from 'dva/fetch';
import { getAccessToken, getRequestId } from 'utils/utils';
import { API_HOST, HZERO_ADM } from 'utils/config';

/**
 * 获取市场配置
 * @function query - 查询列表数据
 */
export function queryMarketConfig(query) {
  return request(`${HZERO_ADM}/v1/market/config`, {
    method: 'GET',
    query,
  });
}
/**
 * 保存市场配置
 */
export function saveMarketConfig(data) {
  return request(`${HZERO_ADM}/v1/market/config`, {
    method: 'POST',
    body: data,
  });
}
/**
 * 获取市场用户端登录用户信息接口
 */
export function getMarketUserInfo(cb) {
  // 这个请求很特殊，获取用户信息，获取到了返回，否则静默失败，不提示
  const checkStatus = (response) => {
    if (response.status === 204) {
      return {};
    }
    if (response.status >= 200 && response.status < 300) {
      if (response.responseType === 'blob') {
        return response.blob();
      }
      try {
        return response.responseType === 'text' ? response.text() : response.json();
      } catch (e) {
        console.log(e);
      }
    }
    // return {};
  };
  fetch(`${API_HOST}${HZERO_ADM}/v1/market/self`, {
    headers: {
      Authorization: `bearer ${getAccessToken()}`,
      credentials: 'include',
      'H-Request-Id': `${getRequestId()}`,
    },
  })
    .then(checkStatus)
    .then((res) => {
      if (typeof cb === 'function') cb(res);
    });
}
/**
 * 市场用户退出客户端登录
 */
export function marketUserLogout(query) {
  return request(`${HZERO_ADM}/v1/market/logout`, {
    method: 'POST',
    body: query,
  });
}
