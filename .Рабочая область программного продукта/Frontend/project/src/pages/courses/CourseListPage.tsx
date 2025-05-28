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
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter state
  const [categories, setCategories] = useState<Category[]>([]);
  const [ageRestrictions, setAgeRestrictions] = useState<AgeRestriction[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [monetizationTypes, setMonetizationTypes] = useState<MonetizationType[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  
  // Selected filters
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedAge, setSelectedAge] = useState<number | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [selectedMonetization, setSelectedMonetization] = useState<number | null>(null);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 1000, max: 20000 });
  
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/courses');
        if (response.data.success) {
          setCourses(response.data.courses);
          setFilteredCourses(response.data.courses);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        showToast('Ошибка при загрузке курсов', 'error');
      }
    };
    
    const fetchFilters = async () => {
      try {
        const [categoriesRes, ageRes, levelsRes, monetizationRes] = await Promise.all([
          api.get('/categories'),
          api.get('/age-restrictions'),
          api.get('/levels'),
          api.get('/monetization-types')
        ]);
        
        if (categoriesRes.data.success) setCategories(categoriesRes.data.categories);
        if (ageRes.data.success) setAgeRestrictions(ageRes.data.ageRestrictions);
        if (levelsRes.data.success) setLevels(levelsRes.data.levels);
        if (monetizationRes.data.success) setMonetizationTypes(monetizationRes.data.monetizationTypes);
      } catch (error) {
        console.error('Error fetching filters:', error);
      }
    };
    
    const fetchFavorites = async () => {
      if (user) {
        try {
          const response = await api.get('/favorites', { params: { userId: user.idusername } });
          if (response.data.success) {
            setFavorites(response.data.favorites.map((item: any) => ({
              idcourse: item.idcourse,
              viewed: item.viewed
            })));
          }
        } catch (error) {
          console.error('Error fetching favorites:', error);
        }
      }
    };
    
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchCourses(), fetchFilters(), fetchFavorites()]);
      setIsLoading(false);
    };
    
    loadData();
  }, [user, showToast]);
  
  useEffect(() => {
    // Apply filters and search
    let result = [...courses];
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        course => 
          course.title.toLowerCase().includes(query) || 
          course.description.toLowerCase().includes(query)
      );
    }
    
    // Apply category filter
    if (selectedCategory) {
      result = result.filter(course => course.idcategory === selectedCategory);
    }
    
    // Apply age restriction filter
    if (selectedAge) {
      result = result.filter(course => course.idagepeople === selectedAge);
    }
    
    // Apply level filter
    if (selectedLevel) {
      result = result.filter(course => course.idlevelknowledge === selectedLevel);
    }
    
    // Apply monetization filter
    if (selectedMonetization) {
      result = result.filter(course => course.idmonetizationcourse === selectedMonetization);
      
      // Apply price range filter for paid courses
      if (selectedMonetization === 2) {
        result = result.filter(
          course => 
            (course.price && course.price >= priceRange.min && course.price <= priceRange.max)
        );
      }
    }
    
    setFilteredCourses(result);
  }, [
    courses, 
    searchQuery, 
    selectedCategory, 
    selectedAge, 
    selectedLevel, 
    selectedMonetization, 
    priceRange
  ]);
  
  const resetFilters = () => {
    setSelectedCategory(null);
    setSelectedAge(null);
    setSelectedLevel(null);
    setSelectedMonetization(null);
    setPriceRange({ min: 1000, max: 20000 });
  };
  
  const toggleFavorite = async (courseId: number) => {
    if (!user) {
      showToast('Для добавления в избранное необходимо авторизоваться', 'info');
      return;
    }
    
    try {
      const existingFavorite = favorites.find(fav => fav.idcourse === courseId);
      const newViewedValue = existingFavorite ? (existingFavorite.viewed === 1 ? 0 : 1) : 1;
      
      await api.post('/favorites', {
        idcourse: courseId,
        idusername: user.idusername,
        viewed: newViewedValue
      });
      
      // Update local state
      if (existingFavorite) {
        setFavorites(favorites.map(fav => 
          fav.idcourse === courseId ? { ...fav, viewed: newViewedValue } : fav
        ));
      } else {
        setFavorites([...favorites, { idcourse: courseId, viewed: newViewedValue }]);
      }
      
      showToast(
        newViewedValue === 1 
          ? 'Курс добавлен в избранное' 
          : 'Курс удален из избранного',
        'success'
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
      showToast('Ошибка при обновлении избранного', 'error');
    }
  };
  
  const handleCourseClick = async (courseId: number) => {
    if (!user) return;
    
    try {
      // Check if this course is already in history
      const existingFavorite = favorites.find(fav => fav.idcourse === courseId);
      
      if (!existingFavorite) {
        // Add to history with viewed=0
        await api.post('/favorites', {
          idcourse: courseId,
          idusername: user.idusername,
          viewed: 0
        });
        
        // Update local state
        setFavorites([...favorites, { idcourse: courseId, viewed: 0 }]);
      }
    } catch (error) {
      console.error('Error adding to history:', error);
    }
  };
  
  const isFavorite = (courseId: number) => {
    return favorites.some(fav => fav.idcourse === courseId && fav.viewed === 1);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Курсы</h1>
        
        <div className="flex items-center space-x-3">
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
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            <SlidersHorizontal size={18} className="mr-2" />
            Фильтры
          </button>
        </div>
      </div>
      
      {/* Filters Section */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Фильтры</h2>
            <div className="flex space-x-3">
              <button
                onClick={resetFilters}
                className="text-orange-600 hover:text-orange-700 text-sm"
              >
                Сбросить все
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Категория
              </label>
              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Все категории</option>
                {categories.map((category) => (
                  <option key={category.idcategory} value={category.idcategory}>
                    {category.type}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Age Restriction Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Возрастное ограничение
              </label>
              <select
                value={selectedAge || ''}
                onChange={(e) => setSelectedAge(e.target.value ? parseInt(e.target.value) : null)}
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
            
            {/* Level Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Уровень сложности
              </label>
              <select
                value={selectedLevel || ''}
                onChange={(e) => setSelectedLevel(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Любой уровень</option>
                {levels.map((level) => (
                  <option key={level.idlevelknowledge} value={level.idlevelknowledge}>
                    {level.type}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Monetization Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Тип доступа
              </label>
              <select
                value={selectedMonetization || ''}
                onChange={(e) => setSelectedMonetization(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Любой тип</option>
                {monetizationTypes.map((type) => (
                  <option key={type.idmonetizationcourse} value={type.idmonetizationcourse}>
                    {type.type}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Price Range (only visible when Paid is selected) */}
          {selectedMonetization === 2 && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Диапазон цен: {priceRange.min} ₽ - {priceRange.max} ₽
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="1000"
                  max="20000"
                  step="500"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) })}
                  className="w-1/2"
                />
                <input
                  type="range"
                  min="1000"
                  max="20000"
                  step="500"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
                  className="w-1/2"
                />
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Courses Grid */}
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
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <BookOpen size={48} className="text-gray-400" />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    course.idmonetizationcourse === 1 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {course.idmonetizationcourse === 1 ? 'Бесплатно' : `${course.price} ₽`}
                  </span>
                  <span className="text-sm text-gray-500">{course.level}</span>
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
                    aria-label={isFavorite(course.idcourse) ? 'Удалить из избранного' : 'Добавить в избранное'}
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