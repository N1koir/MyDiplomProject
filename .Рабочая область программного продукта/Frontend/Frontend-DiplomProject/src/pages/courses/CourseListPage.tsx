import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, BookOpen, Heart, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { api } from '../../services/api';

interface Course {
  idcourse: number;
  title: string;
  description: string;
  idmonetizationcourse: number;
  monetizationType: string;
  price?: number;
  level: string;
  category: string;
  age: string;
  iconBase64: string | null;
}

interface Category {
  idcategory: number;
  type: string;
}

interface AgeRestriction {
  idagepeople: number;
  type: string;
}

interface Level {
  idlevelknowledge: number;
  type: string;
}

interface MonetizationType {
  idmonetizationcourse: number;
  type: string;
}

interface FavoriteItem {
  idcourse: number;
  viewed: number;
}

const CourseListPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  // Весь список курсов, который вернул сервер.
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Поисковая строка (не кнопка, а сразу при изменении отправим запрос).
  const [searchQuery, setSearchQuery] = useState('');

  // Состояния для фильтров (выпадающие списки)
  const [categories, setCategories] = useState<Category[]>([]);
  const [ageRestrictions, setAgeRestrictions] = useState<AgeRestriction[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [monetizationTypes, setMonetizationTypes] = useState<MonetizationType[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  // Текущие выбранные фильтры (значение id или null)
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedAge, setSelectedAge] = useState<number | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [selectedMonetization, setSelectedMonetization] = useState<number | null>(null);

  // Диапазон цен (в рублях). По умолчанию от 1000 до 20000, как у вас было.
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({
    min: 1000,
    max: 20000,
  });

  // Загрузка фильтров (категорий, возрастов, уровней, типов монетизации)
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [categoriesRes, ageRes, levelsRes, monetizationRes] = await Promise.all([
          api.get('/category/categories'),
          api.get('/category/age-restrictions'),
          api.get('/category/levels'),
          api.get('/category/monetization-types'),
        ]);

        if (categoriesRes.data.success) setCategories(categoriesRes.data.categories);
        if (ageRes.data.success) setAgeRestrictions(ageRes.data.ageRestrictions);
        if (levelsRes.data.success) setLevels(levelsRes.data.levels);
        if (monetizationRes.data.success) setMonetizationTypes(monetizationRes.data.monetizationTypes);
      } catch (err) {
        console.error('Ошибка загрузки фильтров', err);
        showToast('Ошибка при загрузке фильтров', 'error');
      }
    };

    fetchFilters();
  }, [showToast]);

  // Загрузка избранного конкретного пользователя (если залогинен)
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return;
      try {
        const response = await api.get('/favorites', {
          params: { userId: user.idusername },
        });
        if (response.data.success) {
          setFavorites(
              response.data.favorites.map((item: any) => ({
                idcourse: item.idcourse,
                viewed: item.viewed,
              }))
          );
        }
      } catch (err) {
        console.error('Ошибка загрузки избранных', err);
      }
    };

    fetchFavorites();
  }, [user]);

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        const params: any = {};

        if (searchQuery.trim() !== '') {
          params.searchQuery = searchQuery.trim();
        }
        if (selectedCategory) {
          params.selectedCategory = selectedCategory;
        }
        if (selectedAge) {
          params.selectedAge = selectedAge;
        }
        if (selectedLevel) {
          params.selectedLevel = selectedLevel;
        }
        if (selectedMonetization) {
          params.selectedMonetization = selectedMonetization;
        }

        if (selectedMonetization === 2) {
          params.priceMin = priceRange.min;
          params.priceMax = priceRange.max;
        }

        const response = await api.get('/courseslist', { params });
        if (response.data.success) {
          setCourses(response.data.courses);
          setFilteredCourses(response.data.courses);
        }
      } catch (err) {
        console.error('Ошибка загрузки курсов:', err);
        showToast('Ошибка при загрузке курсов', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [
    searchQuery,
    selectedCategory,
    selectedAge,
    selectedLevel,
    selectedMonetization,
    priceRange,
    showToast,
  ]);

  // Сбросить все фильтры
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedAge(null);
    setSelectedLevel(null);
    setSelectedMonetization(null);
    setPriceRange({ min: 1000, max: 20000 });
  };

  // Функция проверки, в «избранном» ли курс
  const isFavorite = (courseId: number) => {
    return favorites.some((fav) => fav.idcourse === courseId && fav.viewed === 1);
  };

  // Тоггл избранного
  const toggleFavorite = async (courseId: number) => {
    if (!user) {
      showToast('Для добавления в избранное необходимо авторизоваться', 'info');
      return;
    }
    try {
      const existing = favorites.find((f) => f.idcourse === courseId);
      const newViewed = existing ? (existing.viewed === 1 ? 0 : 1) : 1;

      await api.post('/favorites', {
        idcourse: courseId,
        idusername: user.idusername,
        viewed: newViewed,
      });

      if (existing) {
        setFavorites(
            favorites.map((f) =>
                f.idcourse === courseId ? { ...f, viewed: newViewed } : f
            )
        );
      } else {
        setFavorites([...favorites, { idcourse: courseId, viewed: newViewed }]);
      }

      showToast(
          newViewed === 1 ? 'Курс добавлен в избранное' : 'Курс удалён из избранного',
          'success'
      );
    } catch (err) {
      console.error('Ошибка обновления избранного:', err);
      showToast('Ошибка при обновлении избранного', 'error');
    }
  };

  // Обработчик клика «Открыть курс» (добавляем в историю, если ещё нет)
  const handleCourseClick = async (courseId: number) => {
    if (!user) return;
    try {
      const existing = favorites.find((f) => f.idcourse === courseId);
      if (!existing) {
        await api.post('/favorites', {
          idcourse: courseId,
          idusername: user.idusername,
          viewed: 0,
        });
        setFavorites([...favorites, { idcourse: courseId, viewed: 0 }]);
      }
    } catch (err) {
      console.error('Ошибка добавления в историю:', err);
    }
  };

  return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">Курсы</h1>

          <div className="flex items-center space-x-3">
            {/* Поисковая строка */}
            <div className="relative">
              <input
                  type="text"
                  placeholder="Поиск курсов..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
              />
            </div>

            {/* Кнопка показа/скрытия фильтров */}
            <button
                onClick={() => {} /* Мы всегда показываем фильтры на странице,
                               можно убрать showFilters-переменную, если не нужно скрывать */}
                className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              <SlidersHorizontal size={18} className="mr-2" />
              Фильтры
            </button>
          </div>
        </div>

        {/* === Фильтры (всегда видимы, без showFilters) === */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Фильтры</h2>
            <div>
              <button
                  onClick={resetFilters}
                  className="text-orange-600 hover:text-orange-700 text-sm"
              >
                Сбросить все
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Категория */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Категория
              </label>
              <select
                  value={selectedCategory || ''}
                  onChange={(e) =>
                      setSelectedCategory(e.target.value ? Number(e.target.value) : null)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Все категории</option>
                {categories.map((cat) => (
                    <option key={cat.idcategory} value={cat.idcategory}>
                      {cat.type}
                    </option>
                ))}
              </select>
            </div>

            {/* Возрастное ограничение */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Возрастное ограничение
              </label>
              <select
                  value={selectedAge || ''}
                  onChange={(e) =>
                      setSelectedAge(e.target.value ? Number(e.target.value) : null)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Любой возраст</option>
                {ageRestrictions.map((age) => (
                    <option key={age.idagepeople} value={age.idagepeople}>
                      {age.type}
                    </option>
                ))}
              </select>
            </div>

            {/* Уровень сложности */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Уровень сложности
              </label>
              <select
                  value={selectedLevel || ''}
                  onChange={(e) =>
                      setSelectedLevel(e.target.value ? Number(e.target.value) : null)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Любой уровень</option>
                {levels.map((lvl) => (
                    <option key={lvl.idlevelknowledge} value={lvl.idlevelknowledge}>
                      {lvl.type}
                    </option>
                ))}
              </select>
            </div>

            {/* Тип доступа (монетизация) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Тип доступа
              </label>
              <select
                  value={selectedMonetization || ''}
                  onChange={(e) =>
                      setSelectedMonetization(e.target.value ? Number(e.target.value) : null)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Любой тип</option>
                {monetizationTypes.map((m) => (
                    <option
                        key={m.idmonetizationcourse}
                        value={m.idmonetizationcourse}
                    >
                      {m.type}
                    </option>
                ))}
              </select>
            </div>
          </div>

          {/* Если платный тип выбран (на фронте идёт условие selectedMonetization === 2), показываем слайдеры цен */}
          {selectedMonetization === 2 && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Диапазон цен: {priceRange.min} ₽ – {priceRange.max} ₽
                </label>
                <div className="flex items-center space-x-4">
                  <input
                      type="range"
                      min="1000"
                      max="20000"
                      step="500"
                      value={priceRange.min}
                      onChange={(e) =>
                          setPriceRange({
                            ...priceRange,
                            min: Number(e.target.value),
                          })
                      }
                      className="w-1/2"
                  />
                  <input
                      type="range"
                      min="1000"
                      max="20000"
                      step="500"
                      value={priceRange.max}
                      onChange={(e) =>
                          setPriceRange({
                            ...priceRange,
                            max: Number(e.target.value),
                          })
                      }
                      className="w-1/2"
                  />
                </div>
              </div>
          )}
        </div>

        {/* === Сетка курсов === */}
        {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
        ) : filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map((course) => (
                  <div
                      key={course.idcourse}
                      className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:translate-y-[-5px]"
                  >
                    {course.iconBase64 ? (
                        <img
                            src={course.iconBase64}
                            alt={`Шапка курса ${course.title}`}
                            className="w-full h-48 object-cover"
                        />
                    ) : (
                        <div className="h-48 bg-gray-200 flex items-center justify-center">
                          <BookOpen size={48} className="text-gray-400" />
                        </div>
                    )}

                    <div className="p-6">
                      <div className="flex justify-between items-center mb-2">
                  <span
                      className={`px-2 py-1 text-xs rounded-full ${
                          course.idmonetizationcourse === 1
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                      }`}
                  >
                    {course.idmonetizationcourse === 1
                        ? 'Бесплатно'
                        : `${course.price} ₽`}
                  </span>
                        <span className="text-sm text-gray-500">
                    {course.level}
                  </span>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {course.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <Link
                            to={user ? `/courses/${course.idcourse}` : '/login'}
                            onClick={() => handleCourseClick(course.idcourse)}
                            className="flex-grow px-3 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors text-center mr-2"
                        >
                          {user ? 'Открыть курс' : 'Войти для просмотра'}
                        </Link>
                        <button
                            onClick={() => toggleFavorite(course.idcourse)}
                            className={`p-2 rounded-md ${
                                isFavorite(course.idcourse)
                                    ? 'text-red-500 bg-red-50'
                                    : 'text-gray-400 hover:text-red-500 hover:bg-gray-100'
                            } transition-colors`}
                            aria-label={
                              isFavorite(course.idcourse)
                                  ? 'Удалить из избранного'
                                  : 'Добавить в избранное'
                            }
                        >
                          <Heart
                              size={20}
                              fill={isFavorite(course.idcourse) ? 'currentColor' : 'none'}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
              ))}
            </div>
        ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="text-gray-400 mb-4">
                <Search size={48} className="mx-auto" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Курсы не найдены</h3>
              <p className="text-gray-600 mb-4">
                Попробуйте изменить параметры поиска или фильтры
              </p>
              <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
              >
                Сбросить фильтры
              </button>
            </div>
        )}
      </div>
  );
};

export default CourseListPage;