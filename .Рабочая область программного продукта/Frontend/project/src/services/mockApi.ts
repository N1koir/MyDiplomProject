import { api } from './api';
import SHA256 from 'crypto-js/sha256';

// For demo purposes, we're intercepting the API calls and mocking responses
// In a real application, this would be replaced with actual API calls

// Login endpoint
api.interceptors.request.use((config) => {
  if (config.url === '/auth/login' && config.method === 'post') {
    const data = config.data;
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: any) => u.login === data.login);
    
    if (user) {
      // In a real app, you'd properly compare hashed passwords
      return Promise.resolve({
        data: {
          success: true,
          user: {
            idusername: user.idusername,
            login: user.login,
            idrole: user.idrole
          }
        }
      });
    } else {
      return Promise.resolve({
        data: {
          success: false,
          message: 'Invalid credentials'
        }
      });
    }
  }
  return config;
}, undefined);

// Register endpoint
api.interceptors.request.use((config) => {
  if (config.url === '/auth/register' && config.method === 'post') {
    const data = config.data;
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if username already exists
    const existingUser = users.find((u: any) => u.login === data.login);
    if (existingUser) {
      return Promise.resolve({
        data: {
          success: false,
          message: 'Username already exists'
        }
      });
    }
    
    // Create new user
    const newUser = {
      idusername: users.length > 0 ? Math.max(...users.map((u: any) => u.idusername)) + 1 : 1,
      login: data.login,
      password: data.password,
      dateaddaccount: data.dateaddaccount,
      idrole: data.idrole
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    return Promise.resolve({
      data: {
        success: true,
        user: {
          idusername: newUser.idusername,
          login: newUser.login,
          idrole: newUser.idrole
        }
      }
    });
  }
  return config;
}, undefined);

// Change password endpoint
api.interceptors.request.use((config) => {
  if (config.url === '/auth/change-password' && config.method === 'put') {
    const data = config.data;
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    const userIndex = users.findIndex((u: any) => u.idusername === data.idusername);
    if (userIndex !== -1) {
      // Update password
      users[userIndex].password = data.newPassword;
      localStorage.setItem('users', JSON.stringify(users));
      
      return Promise.resolve({
        data: {
          success: true
        }
      });
    } else {
      return Promise.resolve({
        data: {
          success: false,
          message: 'User not found'
        }
      });
    }
  }
  return config;
}, undefined);

// Get courses endpoint
api.interceptors.request.use((config) => {
  if (config.url === '/courses' && config.method === 'get') {
    const courses = JSON.parse(localStorage.getItem('courses') || '[]');
    const categories = JSON.parse(localStorage.getItem('categories') || '[]');
    const agepeople = JSON.parse(localStorage.getItem('agepeople') || '[]');
    const levelknowledge = JSON.parse(localStorage.getItem('levelknowledge') || '[]');
    const monetization = JSON.parse(localStorage.getItem('monetizationcourse') || '[]');
    
    // Enrich courses with related data
    const enrichedCourses = courses.map((course: any) => {
      const category = categories.find((c: any) => c.idcategory === course.idcategory);
      const age = agepeople.find((a: any) => a.idagepeople === course.idagepeople);
      const level = levelknowledge.find((l: any) => l.idlevelknowledge === course.idlevelknowledge);
      const monetizationType = monetization.find((m: any) => m.idmonetizationcourse === course.idmonetizationcourse);
      
      return {
        ...course,
        category: category?.type || '',
        age: age?.type || '',
        level: level?.type || '',
        monetizationType: monetizationType?.type || ''
      };
    });
    
    return Promise.resolve({
      data: {
        success: true,
        courses: enrichedCourses
      }
    });
  }
  return config;
}, undefined);

// Get course by id endpoint
api.interceptors.request.use((config) => {
  if (config.url?.startsWith('/courses/') && config.method === 'get' && !config.url.includes('/editor')) {
    const id = parseInt(config.url.split('/').pop() || '0');
    const courses = JSON.parse(localStorage.getItem('courses') || '[]');
    const pages = JSON.parse(localStorage.getItem('pages') || '[]');
    
    const course = courses.find((c: any) => c.idcourse === id);
    if (course) {
      const coursePages = pages
        .filter((p: any) => p.idcourse === id)
        .sort((a: any, b: any) => a.numberpage - b.numberpage);
      
      return Promise.resolve({
        data: {
          success: true,
          course,
          pages: coursePages
        }
      });
    } else {
      return Promise.resolve({
        data: {
          success: false,
          message: 'Course not found'
        }
      });
    }
  }
  return config;
}, undefined);

// Create/update course endpoint
api.interceptors.request.use((config) => {
  if (config.url === '/courses' && (config.method === 'post' || config.method === 'put')) {
    const data = config.data;
    const courses = JSON.parse(localStorage.getItem('courses') || '[]');
    const pages = JSON.parse(localStorage.getItem('pages') || '[]');
    
    if (config.method === 'post') {
      // Create new course
      const newCourseId = courses.length > 0 ? Math.max(...courses.map((c: any) => c.idcourse)) + 1 : 1;
      const newCourse = {
        idcourse: newCourseId,
        ...data.course,
        dateadd: new Date().toISOString().split('T')[0]
      };
      
      courses.push(newCourse);
      
      // Add pages
      if (data.pages && Array.isArray(data.pages)) {
        const newPages = data.pages.map((page: any, index: number) => ({
          idpages: pages.length > 0 ? Math.max(...pages.map((p: any) => p.idpages)) + index + 1 : index + 1,
          numberpage: index + 1,
          file: page.content,
          idcourse: newCourseId
        }));
        
        pages.push(...newPages);
      }
      
      localStorage.setItem('courses', JSON.stringify(courses));
      localStorage.setItem('pages', JSON.stringify(pages));
      
      return Promise.resolve({
        data: {
          success: true,
          courseId: newCourseId
        }
      });
    } else if (config.method === 'put') {
      // Update existing course
      const courseIndex = courses.findIndex((c: any) => c.idcourse === data.course.idcourse);
      if (courseIndex !== -1) {
        courses[courseIndex] = {
          ...courses[courseIndex],
          ...data.course
        };
        
        // Update pages
        if (data.pages && Array.isArray(data.pages)) {
          // Remove existing pages
          const filteredPages = pages.filter((p: any) => p.idcourse !== data.course.idcourse);
          
          // Add updated pages
          const updatedPages = data.pages.map((page: any, index: number) => ({
            idpages: filteredPages.length > 0 ? Math.max(...filteredPages.map((p: any) => p.idpages)) + index + 1 : index + 1,
            numberpage: index + 1,
            file: page.content,
            idcourse: data.course.idcourse
          }));
          
          localStorage.setItem('pages', JSON.stringify([...filteredPages, ...updatedPages]));
        }
        
        localStorage.setItem('courses', JSON.stringify(courses));
        
        return Promise.resolve({
          data: {
            success: true
          }
        });
      } else {
        return Promise.resolve({
          data: {
            success: false,
            message: 'Course not found'
          }
        });
      }
    }
  }
  return config;
}, undefined);

// Delete course endpoint
api.interceptors.request.use((config) => {
  if (config.url?.startsWith('/courses/') && config.method === 'delete') {
    const id = parseInt(config.url.split('/').pop() || '0');
    const courses = JSON.parse(localStorage.getItem('courses') || '[]');
    const pages = JSON.parse(localStorage.getItem('pages') || '[]');
    const favorites = JSON.parse(localStorage.getItem('favoritesandhistory') || '[]');
    const payments = JSON.parse(localStorage.getItem('pay') || '[]');
    
    // Remove course
    const filteredCourses = courses.filter((c: any) => c.idcourse !== id);
    
    // Remove related data
    const filteredPages = pages.filter((p: any) => p.idcourse !== id);
    const filteredFavorites = favorites.filter((f: any) => f.idcourse !== id);
    const filteredPayments = payments.filter((p: any) => p.idcourse !== id);
    
    localStorage.setItem('courses', JSON.stringify(filteredCourses));
    localStorage.setItem('pages', JSON.stringify(filteredPages));
    localStorage.setItem('favoritesandhistory', JSON.stringify(filteredFavorites));
    localStorage.setItem('pay', JSON.stringify(filteredPayments));
    
    return Promise.resolve({
      data: {
        success: true
      }
    });
  }
  return config;
}, undefined);

// Get user courses endpoint
api.interceptors.request.use((config) => {
  if (config.url === '/courses/user' && config.method === 'get') {
    const userId = config.params?.userId;
    if (!userId) {
      return Promise.resolve({
        data: {
          success: false,
          message: 'User ID is required'
        }
      });
    }
    
    const courses = JSON.parse(localStorage.getItem('courses') || '[]');
    const userCourses = courses.filter((c: any) => c.idusername === parseInt(userId));
    
    return Promise.resolve({
      data: {
        success: true,
        courses: userCourses
      }
    });
  }
  return config;
}, undefined);

// Get categories, age restrictions, levels endpoint
api.interceptors.request.use((config) => {
  if (config.url === '/categories' && config.method === 'get') {
    const categories = JSON.parse(localStorage.getItem('categories') || '[]');
    return Promise.resolve({
      data: {
        success: true,
        categories
      }
    });
  }
  
  if (config.url === '/age-restrictions' && config.method === 'get') {
    const agepeople = JSON.parse(localStorage.getItem('agepeople') || '[]');
    return Promise.resolve({
      data: {
        success: true,
        ageRestrictions: agepeople
      }
    });
  }
  
  if (config.url === '/levels' && config.method === 'get') {
    const levelknowledge = JSON.parse(localStorage.getItem('levelknowledge') || '[]');
    return Promise.resolve({
      data: {
        success: true,
        levels: levelknowledge
      }
    });
  }
  
  if (config.url === '/monetization-types' && config.method === 'get') {
    const monetizationcourse = JSON.parse(localStorage.getItem('monetizationcourse') || '[]');
    return Promise.resolve({
      data: {
        success: true,
        monetizationTypes: monetizationcourse
      }
    });
  }
  
  return config;
}, undefined);

// Favorites and history endpoints
api.interceptors.request.use((config) => {
  if (config.url === '/favorites' && config.method === 'get') {
    const userId = config.params?.userId;
    if (!userId) {
      return Promise.resolve({
        data: {
          success: false,
          message: 'User ID is required'
        }
      });
    }
    
    const favorites = JSON.parse(localStorage.getItem('favoritesandhistory') || '[]');
    const courses = JSON.parse(localStorage.getItem('courses') || '[]');
    
    const userFavorites = favorites.filter((f: any) => f.idusername === parseInt(userId) && f.viewed === 1);
    
    // Enrich with course data
    const enrichedFavorites = userFavorites.map((fav: any) => {
      const course = courses.find((c: any) => c.idcourse === fav.idcourse);
      return {
        ...fav,
        course
      };
    });
    
    return Promise.resolve({
      data: {
        success: true,
        favorites: enrichedFavorites
      }
    });
  }
  
  if (config.url === '/history' && config.method === 'get') {
    const userId = config.params?.userId;
    if (!userId) {
      return Promise.resolve({
        data: {
          success: false,
          message: 'User ID is required'
        }
      });
    }
    
    const history = JSON.parse(localStorage.getItem('favoritesandhistory') || '[]');
    const courses = JSON.parse(localStorage.getItem('courses') || '[]');
    
    const userHistory = history.filter((h: any) => h.idusername === parseInt(userId));
    
    // Enrich with course data
    const enrichedHistory = userHistory.map((hist: any) => {
      const course = courses.find((c: any) => c.idcourse === hist.idcourse);
      return {
        ...hist,
        course
      };
    });
    
    return Promise.resolve({
      data: {
        success: true,
        history: enrichedHistory
      }
    });
  }
  
  if (config.url === '/favorites' && config.method === 'post') {
    const data = config.data;
    const favorites = JSON.parse(localStorage.getItem('favoritesandhistory') || '[]');
    
    const existingIndex = favorites.findIndex(
      (f: any) => f.idusername === data.idusername && f.idcourse === data.idcourse
    );
    
    if (existingIndex !== -1) {
      // Update existing record
      favorites[existingIndex].viewed = data.viewed;
    } else {
      // Create new record
      const newFavorite = {
        idfavoritesandhistory: favorites.length > 0 ? Math.max(...favorites.map((f: any) => f.idfavoritesandhistory)) + 1 : 1,
        ...data
      };
      favorites.push(newFavorite);
    }
    
    localStorage.setItem('favoritesandhistory', JSON.stringify(favorites));
    
    return Promise.resolve({
      data: {
        success: true
      }
    });
  }
  
  return config;
}, undefined);

// Payment endpoints
api.interceptors.request.use((config) => {
  if (config.url === '/payments' && config.method === 'post') {
    const data = config.data;
    const payments = JSON.parse(localStorage.getItem('pay') || '[]');
    
    // Check if payment already exists
    const existingPayment = payments.find(
      (p: any) => p.idusername === data.idusername && p.idcourse === data.idcourse
    );
    
    if (existingPayment) {
      return Promise.resolve({
        data: {
          success: true,
          message: 'Payment already exists'
        }
      });
    }
    
    // Create new payment
    const newPayment = {
      idpay: payments.length > 0 ? Math.max(...payments.map((p: any) => p.idpay)) + 1 : 1,
      ...data
    };
    
    payments.push(newPayment);
    localStorage.setItem('pay', JSON.stringify(payments));
    
    return Promise.resolve({
      data: {
        success: true
      }
    });
  }
  
  if (config.url === '/payments/check' && config.method === 'get') {
    const userId = config.params?.userId;
    const courseId = config.params?.courseId;
    
    if (!userId || !courseId) {
      return Promise.resolve({
        data: {
          success: false,
          message: 'User ID and Course ID are required'
        }
      });
    }
    
    const payments = JSON.parse(localStorage.getItem('pay') || '[]');
    const courses = JSON.parse(localStorage.getItem('courses') || '[]');
    
    const course = courses.find((c: any) => c.idcourse === parseInt(courseId));
    
    // Free courses are always accessible
    if (course && course.idmonetizationcourse === 1) {
      return Promise.resolve({
        data: {
          success: true,
          hasPaid: true
        }
      });
    }
    
    // Check if user has paid for the course
    const payment = payments.find(
      (p: any) => p.idusername === parseInt(userId) && p.idcourse === parseInt(courseId)
    );
    
    return Promise.resolve({
      data: {
        success: true,
        hasPaid: !!payment
      }
    });
  }
  
  return config;
}, undefined);

export default api;