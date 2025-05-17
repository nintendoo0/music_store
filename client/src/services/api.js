import axios from 'axios';

const api = axios.create({
  // Исправленный baseURL - убран дублирующий /api
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000', // было 'http://localhost:5000/api'
  headers: {
    'Content-Type': 'application/json'
  }
});

// Интерсептор для добавления токена к запросам
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Интерсептор для обработки ответов
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Обработка 401 ошибки (неавторизован)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // Можно выполнить редирект на страницу входа если требуется
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;