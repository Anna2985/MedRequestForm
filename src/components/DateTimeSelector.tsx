import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight, Clock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface DateTimeSelectorProps {
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  onStartDateChange: (date: string) => void;
  onStartTimeChange: (time: string) => void;
  onEndDateChange: (date: string) => void;
  onEndTimeChange: (time: string) => void;
  className?: string;
}

export function DateTimeSelector({
  startDate,
  startTime,
  endDate,
  endTime,
  onStartDateChange,
  onStartTimeChange,
  onEndDateChange,
  onEndTimeChange,
  className = '',
}: DateTimeSelectorProps) {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);

  const validateTimeRange = (newStartDate: string, newStartTime: string, newEndDate: string, newEndTime: string) => {
    const start = new Date(`${newStartDate}T${newStartTime}`);
    const end = new Date(`${newEndDate}T${newEndTime}`);
    return start <= end;
  };

  const handleStartDateChange = (date: string) => {
    if (validateTimeRange(date, startTime, endDate, endTime)) {
      onStartDateChange(date);
    }
  };

  const handleStartTimeChange = (time: string) => {
    if (validateTimeRange(startDate, time, endDate, endTime)) {
      onStartTimeChange(time);
    }
  };

  const handleEndDateChange = (date: string) => {
    if (validateTimeRange(startDate, startTime, date, endTime)) {
      onEndDateChange(date);
    }
  };

  const handleEndTimeChange = (time: string) => {
    if (validateTimeRange(startDate, startTime, endDate, time)) {
      onEndTimeChange(time);
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const parseTime = (timeStr: string) => {
    const [hours, minutes, seconds] = timeStr.split(':').map(Number);
    return { hours: hours || 0, minutes: minutes || 0, seconds: seconds || 0 };
  };

  const formatTime = (hours: number, minutes: number, seconds: number) => {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const CustomSelect = ({
    value,
    options,
    onChange
  }: {
    value: number;
    options: number[];
    onChange: (value: number) => void;
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (ref.current && !ref.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 py-2 px-1 bg-transparent focus:outline-none cursor-pointer text-center hover:bg-gray-100 rounded"
        >
          {String(value).padStart(2, '0')}
        </button>
        {isOpen && (
          <div className="absolute top-full left-0 mt-1 w-12 bg-white border rounded-lg shadow-lg z-50 max-h-[280px] overflow-y-auto">
            {options.map((opt) => (
              <div
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className={`px-2 py-1.5 text-center cursor-pointer hover:bg-blue-500 hover:text-white ${
                  opt === value ? 'bg-blue-500 text-white' : ''
                }`}
              >
                {String(opt).padStart(2, '0')}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const TimeSelect = ({ time, onChange }: { time: string; onChange: (time: string) => void }) => {
    const { hours, minutes, seconds } = parseTime(time);

    const handleChange = (type: 'hours' | 'minutes' | 'seconds', value: number) => {
      const newTime = formatTime(
        type === 'hours' ? value : hours,
        type === 'minutes' ? value : minutes,
        type === 'seconds' ? value : seconds
      );
      onChange(newTime);
    };

    const hourOptions = Array.from({ length: 24 }, (_, i) => i);
    const minuteSecondOptions = Array.from({ length: 60 }, (_, i) => i);

    return (
      <div className="flex items-center border rounded-lg bg-gray-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500 transition-colors">
        <CustomSelect
          value={hours}
          options={hourOptions}
          onChange={(v) => handleChange('hours', v)}
        />
        <span className="text-gray-500">:</span>
        <CustomSelect
          value={minutes}
          options={minuteSecondOptions}
          onChange={(v) => handleChange('minutes', v)}
        />
        <span className="text-gray-500">:</span>
        <CustomSelect
          value={seconds}
          options={minuteSecondOptions}
          onChange={(v) => handleChange('seconds', v)}
        />
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Collapsible Header */}
      <div 
        className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100"
        onClick={toggleExpanded}
      >
        <div className="flex items-center">
          <div className="rounded-lg text-gray-600 transition-colors protected-2 pr-2">
            <Clock className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-gray-800 group-hover:text-gray-600 transition-colors">
            {t('time.range')}
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-gray-600 transition-transform duration-200" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-600 transition-transform duration-200" />
          )}
        </div>
      </div>

      {/* Collapsible Content */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-96 opacity-100 overflow-visible' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-wrap gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('time.type')}</label>
              <select
                defaultValue="操作時間"
                className="w-40 border rounded-lg px-3 py-2 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                <option value="操作時間">{t('time.operation')}</option>
              </select>
            </div>

            <div className="flex-1 min-w-[600px] grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('time.start')}</label>
                <div className="flex gap-3">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    className="w-[180px] border rounded-lg px-3 py-2 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    placeholder="YYYY-MM-DD"
                  />
                  <TimeSelect time={startTime} onChange={handleStartTimeChange} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('time.end')}</label>
                <div className="flex gap-3">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => handleEndDateChange(e.target.value)}
                    className="w-[180px] border rounded-lg px-3 py-2 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    placeholder="YYYY-MM-DD"
                  />
                  <TimeSelect time={endTime} onChange={handleEndTimeChange} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}