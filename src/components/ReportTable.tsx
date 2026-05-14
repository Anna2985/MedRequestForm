import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, FileX } from 'lucide-react';
import type { Transaction } from '../types';

interface ReportTableProps {
  transactions: Transaction[];
  className?: string;
}

type SortField = keyof Transaction;
type SortDirection = 'asc' | 'desc';

const ReportTable: React.FC<ReportTableProps> = ({ transactions, className = '' }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Sort transactions
  const sortedTransactions = useMemo(() => {
    if (!sortField) return transactions;

    return [...transactions].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle numeric fields
      if (sortField === 'TXN_QTY' || sortField === 'EBQ_QTY') {
        aValue = typeof aValue === 'number' ? aValue : parseFloat(aValue as string) || 0;
        bValue = typeof bValue === 'number' ? bValue : parseFloat(bValue as string) || 0;
      }

      // Handle string comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? comparison : -comparison;
      }

      // Handle numeric comparison
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  }, [transactions, sortField, sortDirection]);

  // Paginate transactions
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedTransactions.slice(startIndex, startIndex + pageSize);
  }, [sortedTransactions, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedTransactions.length / pageSize);
  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, sortedTransactions.length);

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

  const columns = [
    { key: 'OP_TIME' as SortField, label: '操作時間', width: '180px' },
    { key: 'MED_BAG_NUM' as SortField, label: '領藥號', width: '120px' },
    { key: 'PAT' as SortField, label: '病人姓名', width: '120px' },
    { key: 'MRN' as SortField, label: '病歷號', width: '120px' },
    { key: 'OP' as SortField, label: '調劑人', width: '100px' },
    { key: 'TXN_QTY' as SortField, label: '收入', width: '80px' },
    { key: 'TXN_QTY' as SortField, label: '支出', width: '80px' },
    { key: 'EBQ_QTY' as SortField, label: '結存量', width: '100px' },
    { key: 'RSN' as SortField, label: '收支原因', width: '120px' },
    { key: 'STOREHOUSE' as SortField, label: '來源', width: '120px' },
    { key: 'NOTE' as SortField, label: '備註', width: '200px' }
  ];

  if (transactions.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
        <div className="flex flex-col items-center justify-center py-12">
          <FileX className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">暫無交易記錄</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-full ${className}`}>
      {/* Header with pagination info */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-base font-normal text-gray-900">
              顯示第 {startRecord}-{endRecord} 筆，共 {sortedTransactions.length} 筆記錄
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
      <div className="overflow-auto flex-1 pb-2">
        <table className="min-w-full table-fixed">
          <thead className="sticky top-0 z-10 bg-gray-100">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={`${column.key}-${index}`}
                  style={{ width: column.width }}
                  className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 transition-colors border-b border-gray-200"
                  onClick={() => handleSort(column.key)}
                >
                  <div className="flex items-center">
                    {column.label}
                    {getSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedTransactions.map((transaction, index) => {
              const txnQty = typeof transaction.TXN_QTY === 'number' ? transaction.TXN_QTY : parseFloat(transaction.TXN_QTY) || 0;
              const income = txnQty > 0 ? txnQty.toString() : '';
              const expense = txnQty <= 0 ? Math.abs(txnQty).toString() : '';
              
              return (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2 text-sm text-gray-900 truncate" title={transaction.OP_TIME}>
                    {transaction.OP_TIME}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900 truncate" title={transaction.MED_BAG_NUM}>
                    {transaction.MED_BAG_NUM}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900 truncate" title={transaction.PAT}>
                    {transaction.PAT}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900 truncate" title={transaction.MRN}>
                    {transaction.MRN}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900 truncate" title={transaction.OP}>
                    {transaction.OP}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900 text-right font-medium">
                    {income && <span className="text-green-600">{income}</span>}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900 text-right font-medium">
                    {expense && <span className="text-red-600">{expense}</span>}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900 text-right font-medium">
                    {transaction.EBQ_QTY}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900 truncate" title={transaction.RSN}>
                    {transaction.RSN}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900 truncate" title={transaction.STOREHOUSE}>
                    {transaction.STOREHOUSE}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900 truncate" title={transaction.NOTE}>
                    {transaction.NOTE}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportTable;