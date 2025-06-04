import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Heart, BookOpen, Clock, History } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { api } from '../../services/api';

interface HistoryItem {
  idfavoritesandhistory: number;
  idcourse: number;
  viewed: number;
  course: {
    idcourse: number;
    title: string;
    description: string;
    idmonetizationcourse: number;
    price?: number;
    iconBase64?: string;
  };
}

const CourseHistoryPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<HistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const response = await api.get('/history', { params: { userId: user.idusername } });

        if (response.data.success) {
          setHistoryItems(response.data.history);
          setFilteredItems(response.data.history);
        }
      } catch (error) {
        console.error('Error fetching history:', error);
        showToast('Ошибка при загрузке истории', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [user, showToast]);
  
  useEffect(() => {
    // Поиск и фильтры
    let filtered = [...historyItems];
    
    // Панель фильтров
    if (activeTab === 'favorites') {
      filtered = filtered.filter(item => item.viewed === 1);
    }
    
    // Поисковик
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        item => 
          item.course.title.toLowerCase().includes(query) || 
          item.course.description.toLowerCase().includes(query)
      );
    }
    
    setFilteredItems(filtered);
  }, [historyItems, searchQuery, activeTab]);

  const toggleFavorite = async (courseId: number) => {
    if (!user) return;

    try {
      const item = historyItems.find(h => h.idcourse === courseId);
      if (!item) return;

      const newViewedValue = item.viewed === 1 ? 0 : 1;

      await api.post('/favorites', {
        idcourse: courseId,
        idusername: user.idusername,
        viewed: newViewedValue
      });

      // Обновление локального состояния
      setHistoryItems(historyItems.map(h =>
        h.idcourse === courseId ? { ...h, viewed: newViewedValue } : h
      ));

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
  
  if (!user) {
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center">
          <History className="mr-2" size={28} />
          История курсов
        </h1>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Поиск по истории..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <Search 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
            size={18} 
          />
        </div>
      </div>
      
      {/* Панель */}
      <div className="flex border-b border-gray-200 mb-8">
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'all' 
              ? 'text-orange-600 border-b-2 border-orange-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('all')}
        >
          Все курсы
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'favorites' 
              ? 'text-orange-600 border-b-2 border-orange-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('favorites')}
        >
          Избранное
        </button>
      </div>
      
      {/* Списки информации */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => (
              <div
                  key={item.idfavoritesandhistory}
                  className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:translate-y-[-5px]"
              >
                {/* Блок с изображением курса */}
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  {item.course.iconBase64 ? (
                      <img
                          src={`data:image/jpeg;base64,${item.course.iconBase64}`}
                          alt={`Шапка курса ${item.course.title}`}
                          className="w-full h-full object-cover"
                      />
                  ) : (
                      <BookOpen size={48} className="text-gray-400" />
                  )}
                </div>

                <div className="p-6">
                <div className="flex justify-between items-center mb-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    item.course.idmonetizationcourse === 1 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {item.course.idmonetizationcourse === 1 ? 'Бесплатно' : `${item.course.price} ₽`}
                  </span>
                  {activeTab === 'all' && (
                    <span className={`text-sm ${item.viewed === 1 ? 'text-orange-500' : 'text-gray-500'}`}>
                      {item.viewed === 1 ? (
                        <span className="flex items-center">
                          <Heart className="mr-1" size={14} fill="currentColor" />
                          В избранном
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Clock className="mr-1" size={14} />
                          В истории
                        </span>
                      )}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.course.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {item.course.description}
                </p>
                <div className="flex justify-between items-center">
                  <Link
                    to={`/courses/${item.course.idcourse}`}
                    className="flex-grow px-3 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors text-center mr-2"
                  >
                    Открыть курс
                  </Link>
                  <button
                    onClick={() => toggleFavorite(item.course.idcourse)}
                    className={`p-2 rounded-md ${
                      item.viewed === 1
                        ? 'text-red-500 bg-red-50' 
                        : 'text-gray-400 hover:text-red-500 hover:bg-gray-100'
                    } transition-colors`}
                    aria-label={item.viewed === 1 ? 'Удалить из избранного' : 'Добавить в избранное'}
                  >
                    <Heart
                      size={20}
                      fill={item.viewed === 1 ? 'currentColor' : 'none'}
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
            {activeTab === 'all' ? (
              <History size={48} className="mx-auto" />
            ) : (
              <Heart size={48} className="mx-auto" />
            )}
          </div>
          <h3 className="text-xl font-semibold mb-2">
            {activeTab === 'all' 
              ? 'История просмотров пуста' 
              : 'У вас нет избранных курсов'}
          </h3>
          <p className="text-gray-600 mb-4">
            {activeTab === 'all'
              ? 'Начните изучать курсы, и они появятся здесь'
              : 'Добавьте курсы в избранное, чтобы они отображались здесь'}
          </p>
          <Link
            to="/courses"
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
          >
            Найти курсы
          </Link>
        </div>
      )}
    </div>
  );
};

export default CourseHistoryPage;