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

export default api;

// For demo purposes, we'll use local storage to mock a database
const initializeLocalDb = () => {
  // Users
  if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify([
      { idusername: 1, login: 'admin', password: 'sha256hash', dateaddaccount: '2023-01-01', idrole: 1 },
      { idusername: 2, login: 'user', password: 'sha256hash', dateaddaccount: '2023-01-02', idrole: 2 }
    ]));
  }

  // Course Categories
  if (!localStorage.getItem('categories')) {
    localStorage.setItem('categories', JSON.stringify([
      { idcategory: 1, type: 'Программирование' },
      { idcategory: 2, type: 'Дизайн' },
      { idcategory: 3, type: 'Маркетинг' },
      { idcategory: 4, type: 'Бизнес' },
      { idcategory: 5, type: 'Наука' }
    ]));
  }

  // Age Restrictions
  if (!localStorage.getItem('agepeople')) {
    localStorage.setItem('agepeople', JSON.stringify([
      { idagepeople: 1, type: '0+' },
      { idagepeople: 2, type: '6+' },
      { idagepeople: 3, type: '12+' },
      { idagepeople: 4, type: '16+' },
      { idagepeople: 5, type: '18+' }
    ]));
  }

  // Level Knowledge
  if (!localStorage.getItem('levelknowledge')) {
    localStorage.setItem('levelknowledge', JSON.stringify([
      { idlevelknowledge: 1, type: 'Начинающий' },
      { idlevelknowledge: 2, type: 'Средний' },
      { idlevelknowledge: 3, type: 'Продвинутый' },
      { idlevelknowledge: 4, type: 'Эксперт' }
    ]));
  }

  // Monetization
  if (!localStorage.getItem('monetizationcourse')) {
    localStorage.setItem('monetizationcourse', JSON.stringify([
      { idmonetizationcourse: 1, type: 'Бесплатно' },
      { idmonetizationcourse: 2, type: 'Платно' }
    ]));
  }

  // Courses
  if (!localStorage.getItem('courses')) {
    localStorage.setItem('courses', JSON.stringify([
      {
        idcourse: 1,
        title: 'Введение в веб-разработку',
        description: 'Базовый курс по HTML, CSS и JavaScript',
        dateadd: '2023-01-10',
        idusername: 1,
        idmonetizationcourse: 1,
        idlevelknowledge: 1,
        idcategory: 1,
        idagepeople: 1,
        price: 0
      },
      {
        idcourse: 2,
        title: 'UI/UX Дизайн с нуля',
        description: 'Основы дизайна пользовательских интерфейсов',
        dateadd: '2023-02-15',
        idusername: 1,
        idmonetizationcourse: 2,
        idlevelknowledge: 2,
        idcategory: 2,
        idagepeople: 2,
        price: 2999
      }
    ]));
  }

  // Pages
  if (!localStorage.getItem('pages')) {
    localStorage.setItem('pages', JSON.stringify([
      { idpages: 1, numberpage: 1, file: '# Введение в HTML\n\nHTML (HyperText Markup Language) - стандартный язык разметки для создания веб-страниц.', idcourse: 1 },
      { idpages: 2, numberpage: 2, file: '# CSS основы\n\nCSS (Cascading Style Sheets) используется для стилизации HTML-элементов.', idcourse: 1 },
      { idpages: 3, numberpage: 1, file: '# Что такое UX/UI дизайн?\n\nUX (User Experience) и UI (User Interface) - два взаимосвязанных аспекта дизайна продукта.', idcourse: 2 }
    ]));
  }

  // Favorites and History
  if (!localStorage.getItem('favoritesandhistory')) {
    localStorage.setItem('favoritesandhistory', JSON.stringify([
      { idfavoritesandhistory: 1, viewed: 1, idcourse: 1, idusername: 2 },
      { idfavoritesandhistory: 2, viewed: 0, idcourse: 2, idusername: 2 }
    ]));
  }

  // Payments
  if (!localStorage.getItem('pay')) {
    localStorage.setItem('pay', JSON.stringify([
      { idpay: 1, idcourse: 2, idusername: 2 }
    ]));
  }
};

// Initialize our mock database
initializeLocalDb();

// Mock API endpoints
// In a real application, these would be actual API calls to the backend

// Add the mock API routes here
// These would be replaced with real API calls in production

export { api };