import axios from 'axios';

// Создание api
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Вывод ошибок
api.interceptors.response.use(
    response => response,
    error => {
      console.error('API Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config.url
      });

      return Promise.reject(error);
    }
);

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Перехватчик для обработки ошибок
api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Если токен истек или недействителен, разлогиниваем пользователя
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
);

export const getMonetizationTypes = () =>
    api.get('/dictionary/monetization').then(res => res.data);

export const getLevelKnowledgeTypes = () =>
    api.get('/dictionary/levelknowledge').then(res => res.data);

export const getCategories = () =>
    api.get('/dictionary/categories').then(res => res.data);

export const getAgeGroups = () =>
    api.get('/dictionary/agepeople').then(res => res.data);

export { api };