import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useEffect } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { BookOpen } from 'lucide-react';
import { api } from '../../services/api';

interface Course {
  idcourse: number;
  title: string;
  dateadd: string;
}

const CourseEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [password, setPassword] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Загрузка курсов пользователя и маппинг полей
  useEffect(() => {
    const fetchUserCourses = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const response = await api.get(`/CoursesControllerEditList/user/${user.idusername}`);

        // Преобразуем ответ из API (PascalCase) в наш интерфейс (camelCase)
        const mapped: Course[] = response.data.map((c: any) => ({
          idcourse: c.idCourse,
          title: c.title,
          dateadd: c.dateAdd
        }));

        setCourses(mapped);
      } catch (error) {
        console.error('Ошибка загрузки курса:', error);
        showToast('Ошибка при загрузке курсов', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserCourses();
  }, [user, showToast]);

  // Фильтрация курсов по полю title
  const filteredCourses = courses.filter(course =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Обработка удаления курса
  const handleDelete = async () => {
    if (!selectedCourse || !user) return;

    try {
      const response = await api.post('/auth/verify-password', {
        idusername: user.idusername,
        password
      });

      if (response.data.success) {
        await api.delete(`/CoursesControllerEditList/${selectedCourse.idcourse}`);
        setCourses(courses.filter(c => c.idcourse !== selectedCourse.idcourse));
        showToast('Курс успешно удален', 'success');
      } else {
        showToast('Неверный пароль', 'error');
      }
    } catch (error) {
      console.error('Неизвестная ошибка:', error);
      showToast('Неизвестная ошибка', 'error');
    } finally {
      setShowPasswordModal(false);
      setShowDeleteModal(false);
      setSelectedCourse(null);
      setPassword('');
    }
  };

  return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Мои курсы</h1>
          <button
              onClick={() => navigate('/courses/editor/new')}
              className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
          >
            <Plus size={20} className="mr-2" />
            Создать курс
          </button>
        </div>

        {/* Поисковая строка */}
        <div className="relative mb-6">
          <input
              type="text"
              placeholder="Поиск курсов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
          />
        </div>

        {/* Список курсов */}
        {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
            </div>
        ) : filteredCourses.length > 0 ? (
            <div className="bg-white rounded-lg shadow-md">
              {filteredCourses.map((course, index) => (
                  <div
                      key={`${course.idcourse}-${index}`}  // ≪ сюда добавили индекс, чтобы ключ всегда был уникальным ≫
                      className="flex items-center justify-between p-4 border-b last:border-b-0"
                  >
                    <div>
                      <h3 className="text-lg font-medium">{course.title}</h3>
                      <p className="text-sm text-gray-500">
                        Создан: {new Date(course.dateadd).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                          onClick={() => navigate(`/courses/editor/${course.idcourse}`)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                          title="Редактировать"
                      >
                        <Pencil size={20} />
                      </button>
                      <button
                          onClick={() => {
                            setSelectedCourse(course);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                          title="Удалить"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
              ))}
            </div>
        ) : (
            <div className="text-center py-8 bg-white rounded-lg shadow-md">
              <p className="text-gray-500">У вас пока нет созданных курсов</p>
            </div>
        )}

        {/* Модальное окно подтверждения удаления */}
        {showDeleteModal && selectedCourse && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md mx-4">
                <h3 className="text-lg font-medium mb-4">
                  Выполняется процесс удаления курса "{selectedCourse.title}"
                </h3>
                <p className="text-gray-600 mb-6">Продолжить?</p>
                <div className="flex justify-end space-x-3">
                  <button
                      onClick={() => {
                        setShowDeleteModal(false);
                        setSelectedCourse(null);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md"
                  >
                    Отмена
                  </button>
                  <button
                      onClick={() => {
                        setShowDeleteModal(false);
                        setShowPasswordModal(true);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-md"
                  >
                    Выполнить
                  </button>
                </div>
              </div>
            </div>
        )}

        {/* Модальное окно ввода пароля */}
        {showPasswordModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md mx-4">
                <h3 className="text-lg font-medium mb-4">
                  Введите пароль для подтверждения
                </h3>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md mb-6"
                    placeholder="Введите пароль"
                />
                <div className="flex justify-end space-x-3">
                  <button
                      onClick={() => {
                        setShowPasswordModal(false);
                        setPassword('');
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md"
                  >
                    Отмена
                  </button>
                  <button
                      onClick={handleDelete}
                      className="px-4 py-2 bg-red-600 text-white rounded-md"
                  >
                    Подтвердить
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  );
};

export default CourseEditorPage;