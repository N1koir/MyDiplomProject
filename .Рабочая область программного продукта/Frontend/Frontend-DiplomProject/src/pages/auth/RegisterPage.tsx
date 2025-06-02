import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { UserPlus, FileText } from 'lucide-react';

const registerSchema = z.object({
  username: z
    .string()
    .min(1, 'Электронная почта обязательна')
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,'Введите корректный адрес электронной почты'),
  password: z
    .string()
    .min(6, 'Пароль должен содержать минимум 6 символов'),
  confirmPassword: z
    .string()
    .min(1, 'Подтверждение пароля обязательно'),
  termsAccepted: z
    .boolean()
    .refine(value => value === true, {
      message: 'Вы должны принять условия политики компании'
    }),
  termsPersonal: z
      .boolean()
      .refine(value => value === true, {
        message: 'Вы должны принять условия об обработки персональных данных'
      })
}).refine(data => data.password === data.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword']
}).refine(data => data.password !== data.username, {
  message: 'Пароль не должен совпадать с логином',
  path: ['password']
});

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      termsAccepted: false
    }
  });
  
  const { register: registerUser } = useAuth();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const success = await registerUser(data.username, data.password);
      if (success) {
        showToast('Регистрация прошла успешно', 'success');
        navigate('/');
      } else {
        showToast('Электронная почта уже используется или произошла ошибка при регистрации', 'error');
      }
    } catch (error) {
      showToast('Произошла ошибка при регистрации', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const openTerms = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowTerms(true);
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Регистрация
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Уже есть аккаунт?{' '}
            <Link to="/login" className="font-medium text-orange-600 hover:text-orange-500">
              Войдите
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">Электронная почта</label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                {...register('username')}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  errors.username ? 'border-red-300 placeholder-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm`}
                placeholder="Электронная почта"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Пароль</label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                {...register('password')}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  errors.password ? 'border-red-300 placeholder-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm`}
                placeholder="Пароль"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">Подтвердите пароль</label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...register('confirmPassword')}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  errors.confirmPassword ? 'border-red-300 placeholder-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm`}
                placeholder="Подтвердите пароль"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="termsAccepted"
              type="checkbox"
              {...register('termsAccepted')}
              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
            />
            <label htmlFor="termsAccepted" className="ml-2 block text-sm text-gray-900">
              Я ознакомлен и согласен с{' '}
              <a
                href="#"
                onClick={openTerms}
                className="font-medium text-orange-600 hover:text-orange-500"
              >
                политикой компании
              </a>
            </label>
          </div>

          <div className="flex items-center">
            <input
                id="termsPersonal"
                type="checkbox"
                {...register('termsPersonal')}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
            />
            <label htmlFor="termsPersonal" className="ml-2 block text-sm text-gray-900">
              Я согласен на обработку персональный данных
            </label>
          </div>
          {errors.termsPersonal && (
            <p className="mt-1 text-sm text-red-600">{errors.termsPersonal.message}</p>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-70"
            >
              {isLoading ? (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </span>
              ) : (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <UserPlus className="h-5 w-5 text-orange-500 group-hover:text-orange-400" aria-hidden="true" />
                </span>
              )}
              {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </div>
        </form>
      </div>

      {/* Terms Modal */}
      {showTerms && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <FileText className="mr-2" size={20} />
                Политика компании
              </h3>
              <button
                onClick={() => setShowTerms(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Закрыть</span>
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            <div className="prose max-w-none">
              <h4>1. Общие положения</h4>
              <p>
                Настоящая Политика определяет порядок обработки и защиты информации о физических
                лицах, пользующихся услугами интернет-сайта Knowledge+ (далее — Сайт).
              </p>
              
              <h4>2. Цели сбора персональной информации пользователя</h4>
              <p>
                Администрация Сайта может использовать персональные данные в следующих целях:
                идентификация стороны в рамках соглашений с Сайтом; предоставление пользователю
                персонализированных услуг; связь с пользователем, в том числе направление
                уведомлений, запросов и информации, касающихся использования Сайта, оказания
                услуг, а также обработка запросов и заявок от пользователя.
              </p>
              
              <h4>3. Условия обработки персональной информации пользователя</h4>
              <p>
                В отношении персональной информации пользователя сохраняется ее конфиденциальность.
                Администрация Сайта принимает необходимые организационные и технические меры для
                защиты персональной информации пользователя от неправомерного или случайного
                доступа, уничтожения, изменения, блокирования, копирования, распространения, а
                также от иных неправомерных действий третьих лиц.
              </p>
              
              <h4>4. Авторские права</h4>
              <p>
                Пользователь обязуется не нарушать авторские права при создании и публикации
                материалов на платформе. Вся ответственность за содержание публикуемых материалов
                лежит на пользователе.
              </p>
              
              <h4>5. Заключительные положения</h4>
              <p>
                Администрация Сайта имеет право вносить изменения в настоящую Политику без
                уведомления пользователей. Новая редакция Политики вступает в силу с момента ее
                размещения на Сайте.
              </p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowTerms(false)}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;