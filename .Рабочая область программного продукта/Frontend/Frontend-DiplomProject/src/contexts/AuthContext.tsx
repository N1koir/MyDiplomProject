import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import axios from 'axios';

export interface User {
  idusername: number;
  login: string;
  idrole: number;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  changePassword: (userId: number, newPassword: string) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Создаем новый экземпляр Axios для каждого запроса
  const createApiInstance = () => {
    return axios.create({
      baseURL: '/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  };

  const login = useCallback(async (username: string, password: string) => {
    try {
      setIsLoading(true);
      const api = createApiInstance(); // Новый экземпляр для запроса

      const response = await api.post('/auth/login', {
        login: username,
        password
      });

      if (response.data) {
        const userData: User = {
          idusername: response.data.idusername,
          login: response.data.login,
          idrole: response.data.idrole
        };

        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login ошибка:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (username: string, password: string) => {
    try {
      setIsLoading(true);
      const api = createApiInstance(); // Новый экземпляр для запроса

      const response = await api.post('/auth/register', {
        login: username,
        password
      });

      if (response.data) {
        const userData: User = {
          idusername: response.data.idusername,
          login: response.data.login,
          idrole: response.data.idrole
        };

        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    try {
      const api = createApiInstance(); // Новый экземпляр для запроса
      api.post('/auth/logout');
    } catch (error) {
      console.error('Logout ошибка:', error);
    }

    setUser(null);
    localStorage.removeItem('user');

    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.split('=');
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });

    setTimeout(() => {
      window.location.reload();
    }, 100);
  }, []);

  const changePassword = useCallback(async (userId: number, newPassword: string) => {
    try {
      setIsLoading(true);
      const api = createApiInstance();

      console.log('Отправка запроса на смену пароля', {
        userId: Number(userId), // Явное преобразование в число
        newPassword
      });

      const response = await api.put('/auth/change-password', {
        UserId: Number(userId), // Явное преобразование в число
        NewPassword: newPassword
      });

      console.log('Ответ на изменение пароля', response);

      return response.status === 200;
    } catch (error: any) {
      console.error('Изменение пароля ошибка:', error);

      if (error.response) {
        console.error('Детали ошибки:', {
          status: error.response.status,
          data: error.response.data,
          message: error.response.data?.message
        });
      }

      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = {
    user,
    login,
    register,
    logout,
    changePassword,
    isLoading
  };

  return (
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
  );
};