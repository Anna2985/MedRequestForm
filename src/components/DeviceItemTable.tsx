import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, FileX, Loader2 } from 'lucide-react';
import type { DeviceItem } from '../types';

interface DeviceItemTableProps {
  items: DeviceItem[];
  selectedDrugs: string[];
  onToggleDrug: (code: string) => void;
  stationSelected: boolean;
  className?: string;
}

type SortField = 'Code' | 'ChineseName' | 'Scientific_Name' | 'DRUGKIND' | 'StorageName' | 'Inventory';
type SortDirection = 'asc' | 'desc';

const DrugKindBadge: React.FC<{ kind: string }> = ({ kind }) => {
  const colorMap: Record<string, string> = {
    'N': 'bg-gray-100 text-gray-700',
    '1': 'bg-yellow-100 text-yellow-800',
    '2': 'bg-orange-100 text-orange-800',
    '3': 'bg-red-100 text-red-800',
    '4': 'bg-rose-100 text-rose-800',
  };
  const cls = colorMap[kind] || 'bg-gray-100 text-gray-700';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {kind || 'N'}
    </span>
  );
};

const DeviceItemTable: React.FC<DeviceItemTableProps> = ({
  items,
  selectedDrugs,
  onToggleDrug,
  stationSelected,
  className = '',
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const sortedItems = useMemo(() => {
    if (!sortField) return items;
    return [...items].sort((a, b) => {
      const aVal = String(a[sortField] ?? '');
      const bVal = String(b[sortField] ?? '');
      const cmp = aVal.localeCompare(bVal, 'zh-TW', { numeric: true });
      return sortDirection === 'asc' ? cmp : -cmp;
    });
  }, [items, sortField, sortDirection]);

  const totalPages = Math.ceil(sortedItems.length / pageSize);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedItems.slice(start, start + pageSize);
  }, [sortedItems, currentPage]);

  const startRecord = sortedItems.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, sortedItems.length);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc'
      ? <ChevronUp className="w-4 h-4 ml-1" />
      : <ChevronDown className="w-4 h-4 ml-1" />;
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const isAllSelected = paginatedItems.length > 0 && paginatedItems.every(i => selectedDrugs.includes(i.Code));
  const isPartiallySelected = paginatedItems.some(i => selectedDrugs.includes(i.Code)) && !isAllSelected;

  const handleSelectAll = () => {
    const codes = paginatedItems.map(i => i.Code);
    const allSelected = codes.every(c => selectedDrugs.includes(c));
    codes.forEach(code => {
      const selected = selectedDrugs.includes(code);
      if (allSelected && selected) onToggleDrug(code);
      else if (!allSelected && !selected) onToggleDrug(code);
    });
  };

  if (!stationSelected) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
        <div className="flex flex-col items-center justify-center py-16">
          <FileX className="w-12 h-12 text-gray-300 mb-4" />
          <p className="text-gray-400 text-base">請先選擇調劑台以載入品項</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-gray-400 mb-4 animate-spin" />
          <p className="text-gray-500 text-base">載入品項中...</p>
        </div>
      </div>
    );
  }

  const SortableTh: React.FC<{
    field: SortField;
    width: string;
    label: string;
  }> = ({ field, width, label }) => (
    <th
      style={{ width }}
      className="px-4 py-2 text-left text-base font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 transition-colors border-b border-gray-200"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center">
        {label}
        {getSortIcon(field)}
      </div>
    </th>
  );

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-base font-normal text-gray-900">
              顯示第 {startRecord}-{endRecord} 筆，共 {sortedItems.length} 筆品項
            </span>
            <span className="text-sm text-gray-600">
              已選擇 {selectedDrugs.length} 個品項
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
                  onChange={e => {
                    const v = parseInt(e.target.value);
                    if (!isNaN(v)) handlePageChange(v);
                  }}
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

      <div className="overflow-x-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
        <table className="min-w-full table-fixed">
          <thead className="sticky top-0 z-10 bg-gray-100">
            <tr>
              <th style={{ width: '56px' }} className="px-4 py-2 text-left border-b border-gray-200">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={input => { if (input) input.indeterminate = isPartiallySelected; }}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                />
              </th>
              <SortableTh field="Code" width="140px" label="藥碼" />
              <SortableTh field="Scientific_Name" width="220px" label="學名" />
              <SortableTh field="ChineseName" width="260px" label="中文藥名" />
              <SortableTh field="DRUGKIND" width="100px" label="管制級別" />
              <SortableTh field="StorageName" width="100px" label="儲位" />
              <th style={{ width: '200px' }} className="px-4 py-2 text-left text-base font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                效期 / 批號
              </th>
              <SortableTh field="Inventory" width="100px" label="庫存" />
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedItems.map(item => (
              <tr
                key={item.Code}
                onClick={() => onToggleDrug(item.Code)}
                className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                  selectedDrugs.includes(item.Code) ? 'bg-blue-50' : ''
                }`}
              >
                <td style={{ width: '56px' }} className="px-4 py-2" onClick={e => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedDrugs.includes(item.Code)}
                    onChange={() => onToggleDrug(item.Code)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                  />
                </td>
                <td style={{ width: '140px' }} className="px-4 py-2 text-sm text-gray-900 font-medium truncate" title={item.Code}>
                  {item.Code}
                </td>
                <td style={{ width: '220px' }} className="px-4 py-2 text-sm text-gray-600 truncate" title={item.Scientific_Name}>
                  {item.Scientific_Name}
                </td>
                <td style={{ width: '260px' }} className="px-4 py-2 text-sm text-gray-900 truncate" title={item.ChineseName}>
                  {item.ChineseName}
                </td>
                <td style={{ width: '100px' }} className="px-4 py-2 text-sm">
                  <DrugKindBadge kind={item.DRUGKIND} />
                </td>
                <td style={{ width: '100px' }} className="px-4 py-2 text-sm text-gray-700">
                  {item.StorageName}
                </td>
                <td style={{ width: '200px' }} className="px-4 py-2 text-sm text-gray-600">
                  <div className="space-y-0.5">
                    {item.List_Validity_period.map((exp, i) => (
                      <div key={i} className="flex gap-2 text-xs">
                        <span className="text-gray-500">{exp}</span>
                        {item.List_Lot_number[i] && (
                          <span className="text-gray-400">#{item.List_Lot_number[i]}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </td>
                <td style={{ width: '100px' }} className="px-4 py-2 text-sm font-semibold text-gray-900">
                  {item.Inventory}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeviceItemTable;
