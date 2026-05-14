import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { logApiCall } from './utils/apiLogger';
import { isAuthenticated } from './utils/auth';
import { useLanguage } from './contexts/LanguageContext';
import { useConfig } from './contexts/ConfigContext';
import Header from './components/Header';
import Footer from './components/Footer';
import LoginForm from './components/LoginForm';
import { DateTimeSelector } from './components/DateTimeSelector';
import StationSelector from './components/StationSelector';
import DrugSelector from './components/DrugSelector';
import OrderModal from './components/OrderModal';
import type { DispensingStation, ServerSettingRequest, MedicationGroup, DeviceItem, Order } from './types';

const STATION_WARD_MAP: Record<string, string> = {
  'FADC(ICU)': 'ICU',
  'FADC(安寧病房)': 'HW',
  'FADC(急診)': 'ER',
  'FADC(玉3)': 'YU3',
  'FADC(玉7)': 'YU7',
  'FADC(玉8)': 'YU8',
};

function getWardForStation(stationName: string): string {
  return STATION_WARD_MAP[stationName] ?? stationName;
}

function App() {
  const { t } = useLanguage();
  const { config, isLoading: isConfigLoading, error: configError } = useConfig();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [stations, setStations] = useState<DispensingStation[]>([]);
  const [selectedStation, setSelectedStation] = useState<string>('');
  const [deviceItems, setDeviceItems] = useState<DeviceItem[]>([]);
  const [filteredDeviceItems, setFilteredDeviceItems] = useState<DeviceItem[]>([]);
  const [selectedDrugs, setSelectedDrugs] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingDeviceItems, setIsLoadingDeviceItems] = useState(false);

  // Initialize date/time with default values
  const today = new Date();

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [startDate, setStartDate] = useState(formatDate(today));
  const [startTime, setStartTime] = useState('00:00:00');
  const [endDate, setEndDate] = useState(formatDate(today));
  const [endTime, setEndTime] = useState('23:59:59');
  const [medicationGroups, setMedicationGroups] = useState<MedicationGroup[]>([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [currentReportDrugIndex, setCurrentReportDrugIndex] = useState(0);
  const [drugReports, setDrugReports] = useState<DrugReport[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      setIsLoggedIn(authenticated);
      setIsInitializing(false);
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (isLoggedIn && !isConfigLoading && config) {
      const initializeData = async () => {
        setIsInitializing(true);
        try {
          await Promise.all([
            fetchStations(),
            fetchMedicationGroups()
          ]);
        } catch (error) {
          console.error('Error initializing data:', error);
          showErrorToast(t('error.init.failed'));
        } finally {
          setIsInitializing(false);
        }
      };

      initializeData();
    }
  }, [isLoggedIn, isConfigLoading, config, t]);

  useEffect(() => {
    const filtered = deviceItems.filter(
      item =>
        item.Code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ChineseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.Scientific_Name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDeviceItems(filtered);
  }, [searchTerm, deviceItems]);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const fetchStations = async () => {
    const request: ServerSettingRequest = {
      ValueAry: ['調劑台']
    };

    try {
      const data = await logApiCall('/api/ServerSetting/get_serversetting_by_type', 'POST', request);
      setStations(data.Data || []);
    } catch (error) {
      console.error('Error:', error);
      showErrorToast(t('error.fetch.station'));
    }
  };

  const fetchMedicationGroups = async () => {
    try {
      const data = await logApiCall('/api/medGroup/get_all_group', 'POST', {});
      setMedicationGroups(data.Data || []);
    } catch (error) {
      console.error('Error:', error);
      showErrorToast(t('error.fetch.group'));
    }
  };

  const fetchDeviceItems = async (stationName: string) => {
    setIsLoadingDeviceItems(true);
    setDeviceItems([]);
    setFilteredDeviceItems([]);
    setSelectedDrugs([]);
    try {
      const data = await logApiCall(`/api/device/list/${encodeURIComponent(stationName)}`, 'GET', null);
      const items: DeviceItem[] = data.Data || [];
      setDeviceItems(items);
      setFilteredDeviceItems(items);
    } catch (error) {
      console.error('Error:', error);
      showErrorToast(t('error.fetch.device'));
    } finally {
      setIsLoadingDeviceItems(false);
    }
  };

  const handleSelectStation = (stationName: string) => {
    if (selectedStation === stationName) return;
    setSelectedStation(stationName);
    fetchDeviceItems(stationName);
  };

  const fetchOrders = async () => {
    setIsLoading(true);

    const startDateTime = `${startDate} ${startTime}`;
    const endDateTime = `${endDate} ${endTime}`;
    const ward = getWardForStation(selectedStation);

    const request = {
      ValueAry: [startDateTime, endDateTime]
    };

    try {
      const data = await logApiCall('/api/order/get_by_creat_time_st_end', 'POST', request);

      const allOrders: Order[] = data.Data || [];
      const filtered = allOrders.filter(o =>
        o.BRYPE === '配方機' &&
        o.WARD === ward &&
        selectedDrugs.includes(o.CODE)
      );

      setOrders(filtered);
      setShowOrderModal(true);
    } catch (error) {
      console.error('Error:', error);
      showErrorToast(t('error.fetch.transaction'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGroupSelection = async (groupGuid: string) => {
    if (!groupGuid) return;

    try {
      const data = await logApiCall('/api/medGroup/get_group_by_guid', 'POST', { ValueAry: [groupGuid] });

      if (data.Data?.[0]?.MedClasses) {
        const groupDrugCodes = data.Data[0].MedClasses.map((drug: { CODE: string }) => drug.CODE);
        setSelectedDrugs(prev => {
          const newSelection = [...new Set([...prev, ...groupDrugCodes])];
          return newSelection;
        });
      }
    } catch (error) {
      console.error('Error:', error);
      showErrorToast(t('error.fetch.group'));
    }
  };

  const toggleDrug = (drugCode: string) => {
    setSelectedDrugs(prev =>
      prev.includes(drugCode)
        ? prev.filter(code => code !== drugCode)
        : [...prev, drugCode]
    );
  };

  const removeDrug = (drugCode: string) => {
    setSelectedDrugs(prev => prev.filter(code => code !== drugCode));
  };

  const handleSelectAllDrugs = () => {
    const allCodes = deviceItems.map(item => item.Code);
    setSelectedDrugs(allCodes);
  };

  const handleClearSelection = () => {
    setSelectedDrugs([]);
  };

  const showErrorToast = (message: string) => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } toast-message min-w-[200px] max-w-[400px] bg-red-50 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-red-800 break-words">{message}</p>
              </div>
            </div>
          </div>
        </div>
      ),
      {
        position: 'top-right',
        duration: 4000,
      }
    );
  };

  const handleExport = () => {
    if (!selectedStation) {
      showErrorToast(t('error.station.required'));
      return;
    }

    if (selectedDrugs.length === 0) {
      showErrorToast(t('error.drug.required'));
      return;
    }

    fetchOrders();
  };

  if (isConfigLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600">載入設定中...</div>
      </div>
    );
  }

  if (configError || !config) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="max-w-md p-6 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h2 className="text-lg font-semibold text-red-900 mb-2">配置載入失敗</h2>
              <p className="text-sm text-red-700 mb-3">
                {configError || '無法載入 config.txt'}
              </p>
              <p className="text-xs text-red-600">
                請確認 config.txt 檔案存在且格式正確
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600">{t('action.loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />

      <Header title="換領單" />

      <main className="flex-1 w-full p-4 space-y-6 pb-16">
        <StationSelector
          stations={stations}
          selectedStation={selectedStation}
          onSelectStation={handleSelectStation}
        />

        <DateTimeSelector
          startDate={startDate}
          startTime={startTime}
          endDate={endDate}
          endTime={endTime}
          onStartDateChange={setStartDate}
          onStartTimeChange={setStartTime}
          onEndDateChange={setEndDate}
          onEndTimeChange={setEndTime}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6"
        />

        <DrugSelector
          deviceItems={filteredDeviceItems}
          allDeviceItems={deviceItems}
          selectedDrugs={selectedDrugs}
          medicationGroups={medicationGroups}
          searchTerm={searchTerm}
          isLoading={isLoading || isLoadingDeviceItems}
          stationSelected={!!selectedStation}
          onSearchChange={setSearchTerm}
          onGroupSelection={handleGroupSelection}
          onSelectAllDrugs={handleSelectAllDrugs}
          onClearSelection={handleClearSelection}
          onExport={handleExport}
          onToggleDrug={toggleDrug}
          onRemoveDrug={removeDrug}
        />
      </main>

      <Footer />

      <OrderModal
        orders={orders}
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        stationName={selectedStation}
        startDateTime={`${startDate} ${startTime}`}
        endDateTime={`${endDate} ${endTime}`}
      />
    </div>
  );
}

export default App;
