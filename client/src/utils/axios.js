import axios from 'axios';

// 設置基礎 URL
axios.defaults.baseURL = 'http://localhost:3001';

// Request 攔截器：為每個請求添加 token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Request config:', config); // 添加日誌
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response 攔截器：處理回應錯誤
axios.interceptors.response.use(
  (response) => {
    console.log('Response:', response); // 添加日誌
    return response;
  },
  (error) => {
    console.error('Response error:', error.response);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axios;