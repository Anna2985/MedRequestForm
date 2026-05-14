import React, { useMemo, useState, useEffect } from 'react';
import { XCircle, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, FileX, Printer, Filter } from 'lucide-react';
import type { Order } from '../types';
import { printOrdersPdf } from '../utils/printPdf';

interface OrderModalProps {
  orders: Order[];
  isOpen: boolean;
  onClose: () => void;
  stationName: string;
  startDateTime: string;
  endDateTime: string;
}

type SortField = keyof Order;
type SortDirection = 'asc' | 'desc';

const columns: { field: SortField; label: string; width: string; align?: 'left' | 'center' | 'right' }[] = [
  { field: 'CT_TIME', label: '建立時間', width: '155px' },
  { field: 'PATCODE', label: '病歷號', width: '110px' },
  { field: 'PATNAME', label: '病人姓名', width: '95px' },
  { field: 'WARD', label: '病房', width: '70px' },
  { field: 'BEDNO', label: '床號', width: '70px' },
  { field: 'SD', label: '單次劑量', width: '85px', align: 'center' as const },
  { field: 'DUNIT', label: '單位', width: '65px' },
  { field: 'FREQ', label: '頻率', width: '75px' },
  { field: 'RROUTE', label: '途徑', width: '75px' },
];

function deduplicateOrders(orders: Order[]): Order[] {
  const seen = new Set<string>();
  return orders.filter(o => {
    const key = `${o.PATCODE}|${o.CT_TIME}|${o.FREQ}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const OrderModal: React.FC<OrderModalProps> = ({
  orders,
  isOpen,
  onClose,
  stationName,
  startDateTime,
  endDateTime,
}) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [isPrinting, setIsPrinting] = useState(false);
  const [deduplicate, setDeduplicate] = useState(true);
  const [selectedGuids, setSelectedGuids] = useState<Set<string>>(new Set());

  const drugGroups = useMemo(() => {
    const map = new Map<string, { code: string; name: string; orders: Order[] }>();
    for (const o of orders) {
      if (!map.has(o.CODE)) {
        map.set(o.CODE, { code: o.CODE, name: o.NAME, orders: [] });
      }
      map.get(o.CODE)!.orders.push(o);
    }
    return Array.from(map.values());
  }, [orders]);

  const drugGroupsDeduped = useMemo(() => {
    return drugGroups.map(g => ({
      ...g,
      orders: deduplicateOrders(g.orders),
    }));
  }, [drugGroups]);

  const activeGroups = deduplicate ? drugGroupsDeduped : drugGroups;
  const totalPages = activeGroups.length;
  const currentGroup = activeGroups[pageIndex] ?? null;

  // Initialize selection to all deduped orders on open / when deduplicate changes
  useEffect(() => {
    if (!isOpen) return;
    const ids = new Set<string>();
    (deduplicate ? drugGroupsDeduped : drugGroups).forEach(g =>
      g.orders.forEach(o => ids.add(o.GUID))
    );
    setSelectedGuids(ids);
  }, [isOpen, deduplicate, drugGroups, drugGroupsDeduped]);

  const sortedOrders = useMemo(() => {
    if (!currentGroup) return [];
    if (!sortField) return currentGroup.orders;
    return [...currentGroup.orders].sort((a, b) => {
      const aVal = String(a[sortField] ?? '');
      const bVal = String(b[sortField] ?? '');
      const cmp = aVal.localeCompare(bVal, 'zh-TW', { numeric: true });
      return sortDirection === 'asc' ? cmp : -cmp;
    });
  }, [currentGroup, sortField, sortDirection]);

  const currentGroupAllSelected = sortedOrders.length > 0 && sortedOrders.every(o => selectedGuids.has(o.GUID));
  const currentGroupSomeSelected = sortedOrders.some(o => selectedGuids.has(o.GUID));

  const toggleRow = (guid: string) => {
    setSelectedGuids(prev => {
      const next = new Set(prev);
      if (next.has(guid)) next.delete(guid);
      else next.add(guid);
      return next;
    });
  };

  const toggleCurrentGroupAll = () => {
    setSelectedGuids(prev => {
      const next = new Set(prev);
      if (currentGroupAllSelected) {
        sortedOrders.forEach(o => next.delete(o.GUID));
      } else {
        sortedOrders.forEach(o => next.add(o.GUID));
      }
      return next;
    });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc'
      ? <ChevronUp className="w-3.5 h-3.5 ml-1 inline" />
      : <ChevronDown className="w-3.5 h-3.5 ml-1 inline" />;
  };

  const goTo = (idx: number) => {
    setPageIndex(Math.max(0, Math.min(totalPages - 1, idx)));
    setSortField(null);
    setSortDirection('asc');
  };

  const selectedCount = selectedGuids.size;

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      const filteredGroups = activeGroups.map(g => ({
        ...g,
        orders: g.orders.filter(o => selectedGuids.has(o.GUID)),
      })).filter(g => g.orders.length > 0);
      await printOrdersPdf(filteredGroups);
    } finally {
      setIsPrinting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-[95vw] max-w-7xl h-[95vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="p-5 border-b border-gray-200 flex items-start justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">換領單處方資料</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {stationName}&nbsp;|&nbsp;{startDateTime} ~ {endDateTime}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              已選 {selectedCount} 筆
            </span>
            {orders.length > 0 && (
              <>
                <button
                  onClick={() => setDeduplicate(v => !v)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    deduplicate
                      ? 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100'
                      : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Filter className="w-3.5 h-3.5" />
                  {deduplicate ? '去重複中' : '顯示全部'}
                </button>
                <button
                  onClick={handlePrint}
                  disabled={isPrinting || selectedCount === 0}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Printer className="w-4 h-4" />
                  {isPrinting ? '準備中...' : '列印 / PDF'}
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-1 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <FileX className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-400 text-base">查無符合條件的處方資料</p>
          </div>
        ) : (
          <>
            {/* Drug navigation bar */}
            <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-sm font-semibold text-gray-700 shrink-0">
                  {currentGroup?.code}
                </span>
                <span className="text-sm text-gray-500 truncate" title={currentGroup?.name}>
                  {currentGroup?.name}
                </span>
                <span className="text-xs text-gray-400 bg-white border border-gray-200 px-2 py-0.5 rounded-full shrink-0">
                  {currentGroup?.orders.length} 筆
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-4">
                <button
                  onClick={() => goTo(pageIndex - 1)}
                  disabled={pageIndex === 0}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  上一藥
                </button>
                <span className="text-sm text-gray-600 px-2">
                  {pageIndex + 1} / {totalPages}
                </span>
                <button
                  onClick={() => goTo(pageIndex + 1)}
                  disabled={pageIndex === totalPages - 1}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  下一藥
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
              <table className="min-w-full table-fixed">
                <thead className="sticky top-0 z-10 bg-gray-100">
                  <tr>
                    <th className="w-10 px-3 py-2.5 border-b border-gray-200">
                      <input
                        type="checkbox"
                        checked={currentGroupAllSelected}
                        ref={el => { if (el) el.indeterminate = !currentGroupAllSelected && currentGroupSomeSelected; }}
                        onChange={toggleCurrentGroupAll}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
                      />
                    </th>
                    {columns.map(col => (
                      <th
                        key={col.field}
                        style={{ width: col.width }}
                        onClick={() => handleSort(col.field)}
                        className={`px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 border-b border-gray-200 whitespace-nowrap select-none ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'}`}
                      >
                        {col.label}
                        {getSortIcon(col.field)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {sortedOrders.map((order, idx) => {
                    const isSelected = selectedGuids.has(order.GUID);
                    return (
                      <tr
                        key={order.GUID || idx}
                        onClick={() => toggleRow(order.GUID)}
                        className={`cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'}`}
                      >
                        <td className="w-10 px-3 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleRow(order.GUID)}
                            onClick={e => e.stopPropagation()}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
                          />
                        </td>
                        <td style={{ width: '155px' }} className="px-3 py-2 text-sm text-gray-600 whitespace-nowrap">
                          {order.CT_TIME}
                        </td>
                        <td style={{ width: '110px' }} className="px-3 py-2 text-sm text-gray-700">
                          {order.PATCODE}
                        </td>
                        <td style={{ width: '95px' }} className="px-3 py-2 text-sm text-gray-800">
                          {order.PATNAME}
                        </td>
                        <td style={{ width: '70px' }} className="px-3 py-2 text-sm text-gray-700">
                          {order.WARD}
                        </td>
                        <td style={{ width: '70px' }} className="px-3 py-2 text-sm text-gray-700">
                          {order.BEDNO}
                        </td>
                        <td style={{ width: '85px' }} className="px-3 py-2 text-sm font-semibold text-gray-900 text-center">
                          {order.SD}
                        </td>
                        <td style={{ width: '65px' }} className="px-3 py-2 text-sm text-gray-600">
                          {order.DUNIT}
                        </td>
                        <td style={{ width: '75px' }} className="px-3 py-2 text-sm text-gray-700">
                          {order.FREQ}
                        </td>
                        <td style={{ width: '75px' }} className="px-3 py-2 text-sm text-gray-700">
                          {order.RROUTE}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderModal;
