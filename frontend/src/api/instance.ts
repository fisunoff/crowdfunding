// src/api/instance.ts
import axios from 'axios';

// Предполагаем, что бэкенд локально, укажи свой URL
const BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор запроса: добавляем токен, если он есть в localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Интерцептор ответа (опционально): можно добавить обработку 401 ошибки для логаута
// api.interceptors.response.use(...)

export default api;
