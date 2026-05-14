import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { logApiCall } from '../utils/apiLogger';
import { saveUserData } from '../utils/auth';
import { useLanguage } from '../contexts/LanguageContext';
import type { LoginResponse } from '../types/auth';

interface LoginFormProps {
  onLoginSuccess: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const { t } = useLanguage();
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await logApiCall('/api/session/login', 'POST', {
        Data: {
          ID: id,
          Password: password
        }
      }) as LoginResponse;

      if (response.Code === 200) {
        const saved = saveUserData(response.Data);
        if (saved) {
          onLoginSuccess();
        } else {
          setError('您沒有使用此系統的權限');
        }
      } else {
        setError(response.Result || '登入失敗');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('系統錯誤，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-white px-8 py-12 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-center text-2xl font-bold text-gray-900 mb-8">
            {t('system.title')}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 p-4 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
                <p className="ml-3 text-sm text-red-700">{error}</p>
              </div>
            )}
            <div>
              <label htmlFor="id" className="block text-sm font-medium text-gray-700">
                帳號
              </label>
              <input
                type="text"
                id="id"
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                密碼
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? '登入中...' : '登入'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;