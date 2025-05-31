import axios from 'axios';

// Создание api
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Вывод ошибок от API
api.interceptors.response.use(
    response => response,
    error => {
        // Логирование деталей ошибки
        console.error('API ошибка:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            url: error.config.url
        });

        // Обработка ошибки 401
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

// Перехватчик для добавления токена к запросам
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});


// API методы
export const getMonetizationTypes = () =>
    api.get('/dictionary/monetization').then(res => res.data);

export const getLevelKnowledgeTypes = () =>
    api.get('/dictionary/levelknowledge').then(res => res.data);

export const getCategories = () =>
    api.get('/dictionary/categories').then(res => res.data);

export const getAgeGroups = () =>
    api.get('/dictionary/agepeople').then(res => res.data);

export { api };