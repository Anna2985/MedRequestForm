import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Table } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import type { DispensingStation } from '../types';

interface StationSelectorProps {
  stations: DispensingStation[];
  selectedStation: string;
  onSelectStation: (stationName: string) => void;
}

const StationSelector: React.FC<StationSelectorProps> = ({
  stations,
  selectedStation,
  onSelectStation,
}) => {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100"
        onClick={toggleExpanded}
      >
        <div className="flex items-center gap-3">
          <div className="pr-2 text-gray-600 hover:text-gray-800 rounded-lg text-blue-600 transition-colors duration-200">
            <Table className="w-5 h-5" />
          </div>
          <div className="flex items-end">
            <h2 className="text-xl font-bold text-gray-800 group-hover:text-gray-600 transition-colors mr-2">
              {t('station.title')}
            </h2>
            {!selectedStation && (
              <span className="text-sm text-gray-500 font-medium">{t('station.select')}</span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {selectedStation && (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
              {selectedStation}
            </span>
          )}
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-gray-600 transition-transform duration-200" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-600 transition-transform duration-200" />
          )}
        </div>
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-4 md:p-6">
          <div className="flex flex-wrap gap-3">
            {stations.map(station => (
              <button
                key={station.id}
                onClick={() => onSelectStation(station.name)}
                className={`
                  min-w-[120px] px-4 py-2.5
                  rounded-lg
                  font-medium
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                  ${
                    selectedStation === station.name
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }
                `}
              >
                {station.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StationSelector;