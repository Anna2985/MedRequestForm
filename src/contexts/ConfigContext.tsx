import React, { createContext, useContext, useState, useEffect } from 'react';

interface Config {
  domain: string;
  homepage: string;
  ai?: string;
}

interface ConfigContextType {
  config: Config | null;
  isLoading: boolean;
  error: string | null;
}

const ConfigContext = createContext<ConfigContextType>({
  config: null,
  isLoading: true,
  error: null
});

export const useConfig = () => useContext(ConfigContext);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<Config | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const timestamp = new Date().getTime();
        const response = await fetch(`/config.txt?t=${timestamp}`);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setConfig(data);
        setError(null);

        (window as any).API_DOMAIN = data.domain;
        (window as any).HOMEPAGE = data.homepage;
        if (data.ai) {
          (window as any).AI_API = data.ai;
        }

        console.log('✅ Configuration loaded:', data);
      } catch (err) {
        const errorMessage = `❌ Failed to load config.txt: ${err instanceof Error ? err.message : String(err)}`;
        console.error(errorMessage);
        setError(errorMessage);
        setConfig(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, []);

  return (
    <ConfigContext.Provider value={{ config, isLoading, error }}>
      {children}
    </ConfigContext.Provider>
  );
};
