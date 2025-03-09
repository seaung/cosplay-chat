import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { message } from 'antd';

// 创建axios实例
const instance = axios.create({
  baseURL: '/',  // 根据实际情况设置baseURL
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
instance.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // 从localStorage获取token
    const token = localStorage.getItem('access_token');
    
    // 如果有token则添加到请求头
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    // 请求错误处理
    message.error('请求发送失败');
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    // 直接返回响应数据
    return response.data;
  },
  (error: AxiosError) => {
    if (error.response) {
      switch (error.response.status) {
        case 401: // 未授权
          // 清除token
          localStorage.removeItem('access_token');
          // 跳转到登录页
          window.location.href = '/login';
          message.error('登录已过期，请重新登录');
          break;
        case 403: // 禁止访问
          message.error('没有权限访问');
          break;
        case 404: // 资源不存在
          message.error('请求的资源不存在');
          break;
        case 500: // 服务器错误
          message.error('服务器错误');
          break;
        default:
          message.error(error.response.data?.message || '请求失败');
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      message.error('网络错误，请检查您的网络连接');
    } else {
      // 请求配置有误
      message.error('请求配置错误');
    }
    
    return Promise.reject(error);
  }
);

// 封装GET请求
export const get = <T>(url: string, params?: any, config?: AxiosRequestConfig) => {
  return instance.get<any, T>(url, { params, ...config });
};

// 封装POST请求
export const post = <T>(url: string, data?: any, config?: AxiosRequestConfig) => {
  return instance.post<any, T>(url, data, config);
};

// 封装PUT请求
export const put = <T>(url: string, data?: any, config?: AxiosRequestConfig) => {
  return instance.put<any, T>(url, data, config);
};

// 封装DELETE请求
export const del = <T>(url: string, config?: AxiosRequestConfig) => {
  return instance.delete<any, T>(url, config);
};

// 导出axios实例
export default instance;