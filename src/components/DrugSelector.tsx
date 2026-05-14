import React from 'react';
import { FileDown, Search, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import DeviceItemTable from './DeviceItemTable';
import type { DeviceItem, MedicationGroup } from '../types';

interface DrugSelectorProps {
  deviceItems: DeviceItem[];
  allDeviceItems: DeviceItem[];
  selectedDrugs: string[];
  medicationGroups: MedicationGroup[];
  searchTerm: string;
  isLoading: boolean;
  stationSelected: boolean;
  onSearchChange: (term: string) => void;
  onGroupSelection: (groupGuid: string) => void;
  onSelectAllDrugs: () => void;
  onClearSelection: () => void;
  onExport: () => void;
  onToggleDrug: (drugCode: string) => void;
  onRemoveDrug: (drugCode: string) => void;
}

const DrugSelector: React.FC<DrugSelectorProps> = ({
  deviceItems,
  allDeviceItems,
  selectedDrugs,
  medicationGroups,
  searchTerm,
  isLoading,
  stationSelected,
  onSearchChange,
  onGroupSelection,
  onSelectAllDrugs,
  onClearSelection,
  onExport,
  onToggleDrug,
  onRemoveDrug,
}) => {
  const { t } = useLanguage();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-6">
          <h2 className="text-xl font-bold text-gray-800">品項資料</h2>
          <div className="relative w-[300px]">
            <input
              type="text"
              placeholder="搜尋藥碼或藥名"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              disabled={!stationSelected}
              className="w-full border rounded-lg px-3 py-2 pl-10 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
          </div>
          <select
            onChange={(e) => onGroupSelection(e.target.value)}
            disabled={!stationSelected}
            className="w-[200px] border rounded-lg px-3 py-2 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            defaultValue=""
          >
            <option value="">{t('drug.group')}</option>
            {medicationGroups.map((group) => (
              <option key={group.GUID} value={group.GUID}>
                {group.NAME}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-4">
          <button
            onClick={onSelectAllDrugs}
            disabled={!stationSelected}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors focus:ring-2 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('action.selectAll')}
          </button>
          <button
            onClick={onClearSelection}
            disabled={!stationSelected}
            className="px-4 py-2 rounded-lg bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 transition-colors focus:ring-2 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('action.clear')}
          </button>
          <button
            onClick={onExport}
            disabled={isLoading}
            className={`flex items-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors focus:ring-2 focus:ring-opacity-50 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <FileDown className="w-5 h-5 mr-2" />
            {isLoading ? t('action.processing') : t('action.export')}
          </button>
        </div>
      </div>

      {selectedDrugs.length > 0 && (
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">{t('drug.selected')}：</h3>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto py-4">
            {selectedDrugs.map(drugCode => {
              const item = allDeviceItems.find(d => d.Code === drugCode);
              return item && (
                <div
                  key={item.Code}
                  className="flex items-center bg-blue-50 text-blue-700 px-3 py-1.5 rounded border border-blue-100"
                >
                  <span className="truncate max-w-[200px]">{item.ChineseName}</span>
                  <button
                    onClick={() => onRemoveDrug(item.Code)}
                    className="ml-2 flex-shrink-0 focus:outline-none hover:text-blue-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <DeviceItemTable
        items={deviceItems}
        selectedDrugs={selectedDrugs}
        onToggleDrug={onToggleDrug}
        stationSelected={stationSelected}
      />
    </div>
  );
};

export default DrugSelector;
