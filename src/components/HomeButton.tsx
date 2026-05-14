import React from 'react';
import { Layers } from 'lucide-react';

interface HomeButtonProps {
  className?: string;
}

const HomeButton: React.FC<HomeButtonProps> = ({ className = '' }) => {
  const handleHomeClick = () => {
    const homepage = (window as any).HOMEPAGE;
    if (homepage) {
      window.location.href = `${homepage}/phar_system/frontpage/`;
    }
  };

  return (
    <button
      onClick={handleHomeClick}
      className={`p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors group relative ${className}`}
      title="藥事管理系統"
    >
      <Layers size={24} />
      <span className="absolute left-1/2 -translate-x-1/2 -bottom-8 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        藥事管理系統
      </span>
    </button>
  );
};

export default HomeButton;