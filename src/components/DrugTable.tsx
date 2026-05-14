import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, FileX } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import type { Drug } from '../types';

interface DrugTableProps {
  drugs: Drug[];
  selectedDrugs: string[];
  onToggleDrug: (drugCode: string) => void;
  className?: string;
}

type SortField = 'CODE' | 'NAME' | 'DIANAME' | 'DRUGKIND';
type SortDirection = 'asc' | 'desc';

const DrugTable: React.FC<DrugTableProps> = ({ 
  drugs, 
  selectedDrugs, 
  onToggleDrug, 
  className = '' 
}) => {
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Sort drugs
  const sortedDrugs = useMemo(() => {
    if (!sortField) return drugs;

    return [...drugs].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle string comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? comparison : -comparison;
      }

      return 0;
    });
  }, [drugs, sortField, sortDirection]);

  // Paginate drugs
  const paginatedDrugs = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedDrugs.slice(startIndex, startIndex + pageSize);
  }, [sortedDrugs, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedDrugs.length / pageSize);
  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, sortedDrugs.length);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      handlePageChange(value);
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4 ml-1" /> : 
      <ChevronDown className="w-4 h-4 ml-1" />;
  };

  const handleSelectAll = () => {
    const currentPageCodes = paginatedDrugs.map(drug => drug.CODE);
    const allSelected = currentPageCodes.every(code => selectedDrugs.includes(code));
    
    if (allSelected) {
      // Deselect all on current page
      currentPageCodes.forEach(code => {
        if (selectedDrugs.includes(code)) {
          onToggleDrug(code);
        }
      });
    } else {
      // Select all on current page
      currentPageCodes.forEach(code => {
        if (!selectedDrugs.includes(code)) {
          onToggleDrug(code);
        }
      });
    }
  };

  const isAllSelected = paginatedDrugs.length > 0 && paginatedDrugs.every(drug => selectedDrugs.includes(drug.CODE));
  const isPartiallySelected = paginatedDrugs.some(drug => selectedDrugs.includes(drug.CODE)) && !isAllSelected;

  if (drugs.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
        <div className="flex flex-col items-center justify-center py-12">
          <FileX className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">暫無藥品資料</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header with pagination info */}
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-base font-normal text-gray-900">
              顯示第 {startRecord}-{endRecord} 筆，共 {sortedDrugs.length} 筆藥品
            </span>
            <span className="text-sm text-gray-600">
              已選擇 {selectedDrugs.length} 個藥品
            </span>
          </div>
          
          {totalPages > 1 && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                上一頁
              </button>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">第</span>
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={currentPage}
                  onChange={handlePageInputChange}
                  className="w-16 px-2 py-1 text-center border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-sm text-gray-600">頁，共 {totalPages} 頁</span>
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                下一頁
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table container */}
      <div className="overflow-x-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
        <table className="min-w-full table-fixed">
          <thead className="sticky top-0 z-10 bg-gray-100">
            <tr>
              <th 
                style={{ width: '100px' }} 
                className="px-4 py-2 text-left border-b border-gray-200"
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = isPartiallySelected;
                    }}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                  />
                  <span className="ml-2 text-base font-medium text-gray-500 uppercase tracking-wider">
                    {t('drug.select')}
                  </span>
                </div>
              </th>
              <th
                style={{ width: '180px' }}
                className="px-4 py-2 text-left text-base font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 transition-colors border-b border-gray-200"
                onClick={() => handleSort('CODE')}
              >
                <div className="flex items-center">
                  {t('drug.code')}
                  {getSortIcon('CODE')}
                </div>
              </th>
              <th
                style={{ width: '400px' }}
                className="px-4 py-2 text-left text-base font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 transition-colors border-b border-gray-200"
                onClick={() => handleSort('NAME')}
              >
                <div className="flex items-center">
                  {t('drug.name')}
                  {getSortIcon('NAME')}
                </div>
              </th>
              <th
                style={{ width: '350px' }}
                className="px-4 py-2 text-left text-base font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 transition-colors border-b border-gray-200"
                onClick={() => handleSort('DIANAME')}
              >
                <div className="flex items-center">
                  學名
                  {getSortIcon('DIANAME')}
                </div>
              </th>
              <th
                style={{ width: '120px' }}
                className="px-4 py-2 text-left text-base font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 transition-colors border-b border-gray-200"
                onClick={() => handleSort('DRUGKIND')}
              >
                <div className="flex items-center">
                  {t('drug.control')}
                  {getSortIcon('DRUGKIND')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedDrugs.map((drug) => (
              <tr
                key={drug.CODE}
                onClick={() => onToggleDrug(drug.CODE)}
                className="hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <td 
                  style={{ width: '100px' }} 
                  className="px-4 py-2" 
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={selectedDrugs.includes(drug.CODE)}
                    onChange={() => onToggleDrug(drug.CODE)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                  />
                </td>
                <td 
                  style={{ width: '180px' }} 
                  className="px-4 py-2 text-sm text-gray-900 font-medium truncate" 
                  title={drug.CODE}
                >
                  {drug.CODE}
                </td>
                <td
                  style={{ width: '400px' }}
                  className="px-4 py-2 text-sm text-gray-900 truncate"
                  title={drug.NAME}
                >
                  {drug.NAME}
                </td>
                <td
                  style={{ width: '350px' }}
                  className="px-4 py-2 text-sm text-gray-600 truncate"
                  title={drug.DIANAME}
                >
                  {drug.DIANAME}
                </td>
                <td
                  style={{ width: '120px' }}
                  className="px-4 py-2 text-sm text-gray-900 truncate"
                >
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    drug.DRUGKIND === 'N' ? 'bg-gray-100 text-gray-800' :
                    drug.DRUGKIND === '1' ? 'bg-yellow-100 text-yellow-800' :
                    drug.DRUGKIND === '2' ? 'bg-orange-100 text-orange-800' :
                    drug.DRUGKIND === '3' ? 'bg-red-100 text-red-800' :
                    drug.DRUGKIND === '4' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {drug.DRUGKIND || 'N'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DrugTable;