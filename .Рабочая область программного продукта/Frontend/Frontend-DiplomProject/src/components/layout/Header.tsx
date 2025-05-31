import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Search, LogIn, UserCircle, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    navigate('/');
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-gray-900 text-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="flex items-center text-xl font-bold">
            <BookOpen className="mr-2" size={24} />
            <span className="text-white">Knowledge</span>
            <span className="text-orange-500">+</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/courses" className="hover:text-orange-400 transition-colors">
            Каталог курсов
          </Link>
          {user ? (
            <>
              <Link to="/courses/editor" className="hover:text-orange-400 transition-colors">
                Редактор курсов
              </Link>
              <Link to="/courses/history" className="hover:text-orange-400 transition-colors">
                История курсов
              </Link>
            </>
          ) : null}
        </nav>

        <div className="hidden md:flex items-center space-x-3">
          {user ? (
              <div className="relative group flex items-center gap-2">
                <button
                    className="flex items-center bg-gray-800 rounded-full px-3 py-1 hover:bg-gray-700 transition-colors"
                    onClick={() => navigate('/profile')}
                >
                  <UserCircle className="mr-2" size={20} />
                  <span className="truncate max-w-[100px]">{user.login}</span>
                </button>

                <button
                    onClick={handleLogout}
                    className="flex items-center justify-center p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
                >
                  <LogOut size={18} />
                </button>
              </div>
          ) : (
            <div className="flex space-x-2">
              <Link 
                to="/login" 
                className="px-4 py-1 border border-gray-600 rounded-md hover:bg-gray-800 transition-colors"
              >
                Войти
              </Link>
              <Link 
                to="/register"
                className="px-4 py-1 bg-orange-600 rounded-md hover:bg-orange-700 transition-colors"
              >
                Регистрация
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button 
          className="md:hidden flex items-center"
          onClick={toggleMenu}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-800 p-4">
          <nav className="flex flex-col space-y-3">
            <Link 
              to="/courses" 
              className="hover:text-orange-400 transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Курсы
            </Link>
            {user ? (
              <>
                <Link 
                  to="/courses/editor" 
                  className="hover:text-orange-400 transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Редактор курсов
                </Link>
                <Link 
                  to="/courses/history"
                  className="hover:text-orange-400 transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  История курсов
                </Link>
                <Link 
                  to="/profile" 
                  className="hover:text-orange-400 transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Профиль
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-left hover:text-orange-400 transition-colors py-2"
                >
                  Выйти
                </button>
              </>
            ) : (
              <div className="flex flex-col space-y-2 pt-2">
                <Link 
                  to="/login" 
                  className="px-4 py-2 text-center border border-gray-600 rounded-md hover:bg-gray-700 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Войти
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-2 text-center bg-orange-600 rounded-md hover:bg-orange-700 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Регистрация
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Выход из профиля</h3>
            <p className="text-gray-600 mb-6">Хотите ли вы выйти из профиля?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelLogout}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;