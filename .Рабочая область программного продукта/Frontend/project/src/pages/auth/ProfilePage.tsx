import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { UserCircle, Lock } from 'lucide-react';

const passwordChangeSchema = z.object({
  newPassword: z
      .string()
      .min(6, 'Новый пароль должен содержать минимум 6 символов'),
  confirmNewPassword: z
      .string()
      .min(1, 'Подтверждение пароля обязательно')
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmNewPassword']
});

type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;

const ProfilePage = () => {
  const { user, changePassword, logout } = useAuth(); // Добавлен logout
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid } // Добавлена проверка валидности
  } = useForm<PasswordChangeFormData>({
    resolver: zodResolver(passwordChangeSchema),
    mode: 'onChange' // Проверка при каждом изменении
  });

  if (!user) {
    return <div>Загрузка...</div>;
  }

  const onSubmit = async (data: PasswordChangeFormData) => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Явное преобразование в число
      const userId = Number(user.idusername);
      const success = await changePassword(userId, data.newPassword);

      if (success) {
        showToast('Пароль успешно изменен', 'success');
        setIsEditing(false);
        reset();

        // Автоматический выход
        setTimeout(() => {
          showToast('Пожалуйста, войдите с новым паролем', 'info');
          logout();
        }, 2000);
      } else {
        showToast('Не удалось изменить пароль', 'error');
      }
    } catch (error) {
      showToast('Произошла ошибка при изменении пароля', 'error');
      console.error('Password change error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = () => {
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    reset();
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gray-800 px-6 py-4">
          <h1 className="text-xl font-bold text-white flex items-center">
            <UserCircle className="mr-2" size={24} />
            Профиль пользователя
          </h1>
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-center mb-8">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
              <UserCircle className="text-gray-500" size={64} />
            </div>
          </div>

          <div className="border-b border-gray-200 pb-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Информация аккаунта</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Логин</p>
                <p className="font-medium">{user.login}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Пароль</p>
                <p className="font-medium">••••••••</p>
              </div>
            </div>
          </div>

          {!isEditing ? (
            <div className="flex justify-end">
              <button
                onClick={startEditing}
                className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
              >
                <Lock className="mr-2" size={16} />
                Изменить пароль
              </button>
            </div>
          ) : (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Изменение пароля</h3>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-4">
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Новый пароль
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    {...register('newPassword')}
                    className={`w-full px-3 py-2 border ${
                      errors.newPassword ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500`}
                  />
                  {errors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
                  )}
                </div>
                
                <div className="mb-6">
                  <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Подтвердите новый пароль
                  </label>
                  <input
                    id="confirmNewPassword"
                    type="password"
                    {...register('confirmNewPassword')}
                    className={`w-full px-3 py-2 border ${
                      errors.confirmNewPassword ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500`}
                  />
                  {errors.confirmNewPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmNewPassword.message}</p>
                  )}
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors disabled:opacity-70"
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <span className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Сохранение...
                      </span>
                    ) : (
                      'Сохранить'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;