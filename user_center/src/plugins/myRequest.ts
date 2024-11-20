import { extend } from 'umi-request';
import { message } from 'antd'; // 提示框
import { history } from '@@/core/history';
import { stringify } from 'querystring';

const request = extend({
  credentials: 'include', // 默认请求是否带上cookie
  // requestType: 'form',
});

/**
 * 所有请求拦截器
 *  1. 在请求后端API前，统一做处理，比如 改变url参数，附带统一参数等
 */
request.interceptors.request.use((url, options) => {
  // 打印每次请求的API
  console.log(`do request url = ${url}`);

  return {
    url,
    options: {
      ...options,
      // headers: {},
    },
  };
});

/**
 * 所有响应拦截器
 *  1. 接收来自后端返回结果后，统一处理地方，比如异常处理提示
 */
request.interceptors.response.use(async (response) => {
  const res = await response.clone().json();
  if (res.code === 0) {
    // 成功，则取出 data内容 直接返回
    return res.data;
  }
  if (res.code === 40100) {
    // 未登录错误码
    if (history.location.pathname !== '/') {
      message.error('请先登录');
    }
    // 跳转登录地址
    history.replace({
      pathname: '/user/login',
      search: stringify({
        redirect: location.pathname,
      }),
    });
  } else {
    message.error(res.description);
  }
  return res.data;
});

export default request;
