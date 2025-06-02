import axios from 'axios';

// Создание api
const api = axios.create({
  baseURL: '/api',
  timeout: 10000
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
    api.get('/category/monetization-types').then(res => res.data);

export const getLevelKnowledgeTypes = () =>
    api.get('/category/levels').then(res => res.data);

export const getCategories = () =>
    api.get('/category/categories').then(res => res.data);

export const getAgeGroups = () =>
    api.get('/category/age-restrictions').then(res => res.data);


export { api };