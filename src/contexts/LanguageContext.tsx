import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'zh-TW' | 'en';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string, params?: string[]) => string;
}

const translations = {
  'zh-TW': {
    'system.title': '換領單系統',
    'system.department': '軟體部',
    'system.copyright': '鴻森智能科技',
    'inventory.title': '換領單',
    'station.title': '調劑台',
    'station.select': '(請選擇一個調劑台)',
    'time.type': '時間類型',
    'time.operation': '操作時間',
    'time.start': '開始日期時間',
    'time.end': '結束日期時間',
    'time.range': '時間區間',
    'drug.title': '藥檔資料',
    'drug.search': '搜尋藥碼或藥名',
    'drug.group': '選擇藥品群組',
    'drug.selected': '已選擇的藥品',
    'drug.code': '藥碼',
    'drug.name': '藥名',
    'drug.control': '管制級別',
    'drug.select': '選擇',
    'drug.total': '共 {0} 筆資料',
    'action.selectAll': '全選',
    'action.clear': '清除選擇',
    'action.export': '輸出報表',
    'action.processing': '處理中...',
    'action.loading': '載入中...',
    'language': '繁體中文',
    'action.logout': '登出',
    'error.station.required': '請選擇一個調劑台',
    'error.drug.required': '請選擇至少一個藥品',
    'error.fetch.device': '無法取得調劑台品項資料',
    'error.init.failed': '初始化資料失敗',
    'error.export.failed': '匯出Excel檔案失敗',
    'error.fetch.station': '無法取得調劑台資料',
    'error.fetch.drug': '無法取得藥品資料',
    'error.fetch.group': '無法取得藥品群組',
    'error.fetch.transaction': '無法取得交易資料',
    'user.notLoggedIn': '未登入'
  },
  'en': {
    'system.title': 'Medication Exchange Form',
    'system.department': 'Software Department',
    'system.copyright': '鴻森智能科技',
    'inventory.title': 'Medication Exchange Form',
    'station.title': 'Dispensing Station',
    'station.select': '(Please select a dispensing station)',
    'time.type': 'Time Type',
    'time.operation': 'Operation Time',
    'time.start': 'Start Date Time',
    'time.end': 'End Date Time',
    'time.range': 'Time Range',
    'drug.title': 'Drug Information',
    'drug.search': 'Search by code or name',
    'drug.group': 'Select Drug Group',
    'drug.selected': 'Selected Drugs',
    'drug.code': 'Code',
    'drug.name': 'Name',
    'drug.control': 'Control Level',
    'drug.select': 'Select',
    'drug.total': 'Total {0} records',
    'action.selectAll': 'Select All',
    'action.clear': 'Clear',
    'action.export': 'Export Report',
    'action.processing': 'Processing...',
    'action.loading': 'Loading...',
    'language': 'English',
    'action.logout': 'Logout',
    'error.station.required': 'Please select a dispensing station',
    'error.drug.required': 'Please select at least one drug',
    'error.fetch.device': 'Failed to fetch device item data',
    'error.init.failed': 'Failed to initialize data',
    'error.export.failed': 'Failed to export Excel file',
    'error.fetch.station': 'Failed to fetch station data',
    'error.fetch.drug': 'Failed to fetch drug data',
    'error.fetch.group': 'Failed to fetch drug group',
    'error.fetch.transaction': 'Failed to fetch transaction data',
    'user.notLoggedIn': 'Not logged in'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('zh-TW');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'zh-TW' ? 'en' : 'zh-TW');
  };

  const t = (key: string, params: string[] = []): string => {
    let translation = translations[language][key] || key;
    params.forEach((param, index) => {
      translation = translation.replace(`{${index}}`, param);
    });
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}