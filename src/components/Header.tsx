import React from 'react';
import { LogOut, Layers, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getUserData, clearUserData } from '../utils/auth';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const { t, toggleLanguage } = useLanguage();

  const userData = getUserData();
  const subtitle = userData
    ? `${userData.Name} - ${userData.Employer || t('system.department')}`
    : t('user.notLoggedIn');

  const handleLogout = () => {
    clearUserData();
    window.location.reload();
  };

  const handleHomeClick = () => {
    const homepage = (window as any).HOMEPAGE;
    if (homepage) {
      window.location.href = `${homepage}/phar_system/frontpage/`;
    }
  };

  return (
    <header className="bg-white">
      <div className="w-full p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleHomeClick}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors group relative"
              title={t('system.title')}
            >
              <Layers size={24} />
              <span className="absolute left-1/2 -translate-x-1/2 -bottom-8 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {t('system.title')}
              </span>
            </button>

            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
                {t('inventory.title')}
              </h1>
              <p className="text-gray-600 text-sm">
                {subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleLanguage}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <Globe className="h-4 w-4 mr-2" />
              {t('language')}
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <LogOut className="h-4 w-4 mr-2" />
              {t('action.logout')}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;