import { Link } from 'react-router-dom';
import { BookOpen, Mail, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link to="/" className="flex items-center text-xl font-bold mb-4">
              <BookOpen className="mr-2" size={24} />
              <span className="text-white">Knowledge</span>
              <span className="text-orange-500">+</span>
            </Link>
            <p className="text-sm">
              Универсальная платформа образования, объединяющая экспертов и учащихся 
              из различных областей
            </p>
          </div>
          
          <div></div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Контакты</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Mail size={16} className="mr-2" />
                <a href="mailto:nikoir@nikitabuyanovr.ru" className="hover:text-orange-400 transition-colors">
                  nikoir@nikitabuyanovr.ru
                </a>
              </li>
              <li className="flex items-center">
                <Phone size={16} className="mr-2" />
                <a href="tel:+79145054052" className="hover:text-orange-400 transition-colors">
                  +7 (914) 505-4052
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-6 text-sm text-center">
          <p>© {new Date().getFullYear()} Knowledge+. Все права защищены.</p>
          <p>Дипломный проект Буянова Никиты Родионовича ИСиП-22-4к</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;