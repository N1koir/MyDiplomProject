import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, FileText, Users, DollarSign } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {

  const { user } = useAuth();

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block px-3 py-1 text-sm bg-orange-600 rounded-full mb-4">
              Универсальная платформа образования
            </span>
            <h1 className="text-3xl md:text-5xl font-bold mb-6">
              Создавайте и изучайте курсы на <span className="text-orange-500">Knowledge+</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8">
              Наша платформа объединяет экспертов и учащихся из различных областей. 
              Создавайте, делитесь и изучайте материалы в удобном формате.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/courses"
                className="px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-md font-medium transition-colors"
              >
                Начать обучение
              </Link>
              {user && (
                <Link
                  to="/courses/editor"
                  className="px-6 py-3 bg-white text-gray-900 hover:bg-gray-100 rounded-md font-medium transition-colors"
                >
                  Создать курс
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Преимущества платформы</h2>
          <p className="text-center text-gray-600 max-w-3xl mx-auto mb-16">
            Knowledge+ предоставляет широкие возможности для создания и изучения 
            образовательных материалов
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-lg shadow-md transition-transform duration-300 hover:translate-y-[-5px]">
              <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="text-orange-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Богатый формат</h3>
              <p className="text-gray-600">
                Создавайте материалы с использованием Markdown, добавляйте изображения и видео
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-lg shadow-md transition-transform duration-300 hover:translate-y-[-5px]">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <FileText className="text-blue-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Современный редактор</h3>
              <p className="text-gray-600">
                Удобный интерфейс для создания контента с предпросмотром в реальном времени
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-lg shadow-md transition-transform duration-300 hover:translate-y-[-5px]">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Users className="text-green-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Учитесь в своем темпе</h3>
              <p className="text-gray-600">
                Доступ к материалам 24/7, изучайте в удобное для вас время
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-white p-6 rounded-lg shadow-md transition-transform duration-300 hover:translate-y-[-5px]">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="text-purple-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Монетизация</h3>
              <p className="text-gray-600">
                Создавайте бесплатные или платные курсы и делитесь своими знаниями
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-orange-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Готовы начать обучение?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Присоединяйтесь к нашему сообществу и получите доступ к качественным образовательным материалам
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/courses"
              className="px-6 py-3 bg-white text-orange-600 hover:bg-gray-100 rounded-md font-medium transition-colors"
            >
              Смотреть курсы
            </Link>
            {!user && (
              <Link
                to="/register"
                className="px-6 py-3 border-2 border-white hover:bg-orange-700 rounded-md font-medium transition-colors"
              >
                Зарегистрироваться
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Popular Courses Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Популярные курсы</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Course 1 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:translate-y-[-5px]">
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <BookOpen size={48} className="text-gray-400" />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Бесплатно
                  </span>
                  <span className="text-sm text-gray-500">Начинающий</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Введение в веб-разработку</h3>
                <p className="text-gray-600 mb-4">
                  Базовый курс по HTML, CSS и JavaScript
                </p>
                <Link
                  to="/courses/1"
                  className="block text-center w-full py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                >
                  {user ? 'Открыть курс' : 'Войти для просмотра'}
                </Link>
              </div>
            </div>
            
            {/* Course 2 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:translate-y-[-5px]">
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <BookOpen size={48} className="text-gray-400" />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    2999 ₽
                  </span>
                  <span className="text-sm text-gray-500">Средний</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">UI/UX Дизайн с нуля</h3>
                <p className="text-gray-600 mb-4">
                  Основы дизайна пользовательских интерфейсов
                </p>
                <Link
                  to="/courses/2"
                  className="block text-center w-full py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                >
                  {user ? 'Открыть курс' : 'Войти для просмотра'}
                </Link>
              </div>
            </div>
            
            {/* Course 3 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:translate-y-[-5px]">
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <BookOpen size={48} className="text-gray-400" />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Бесплатно
                  </span>
                  <span className="text-sm text-gray-500">Продвинутый</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">React для начинающих</h3>
                <p className="text-gray-600 mb-4">
                  Основы React, хуки, роутинг и работа с API
                </p>
                <Link
                  to="/login"
                  className="block text-center w-full py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                >
                  {user ? 'Открыть курс' : 'Войти для просмотра'}
                </Link>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link
              to="/courses"
              className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium"
            >
              Смотреть все курсы
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;