import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { LanguageProvider } from './contexts/LanguageContext';
import { ConfigProvider } from './contexts/ConfigContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </ConfigProvider>
  </StrictMode>
);