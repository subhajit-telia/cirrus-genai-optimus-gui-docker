import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { NetworkInfo } from '../routes/network';

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  role: string;
  configData: any;
  configLoading: boolean;
  login: (role: string) => Promise<void>;
  refreshConfig: () => Promise<any>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [role, setRole] = useState<string>('');
  const [configData, setConfigData] = useState<any>(null);
  const [configLoading, setConfigLoading] = useState<boolean>(false);
  const apiUrl = `${NetworkInfo.URL}`;

  const refreshConfig = async () => {
    setConfigLoading(true);
    try {
      const response = await fetch(apiUrl + '/config/?filters=status:active', {
        method: 'GET',
        headers: {
          'access_token': `${NetworkInfo.ACCESSTOKEN}`,
          'Content-Type': 'application/json',
        },
      });

      const responseData = await response.json();
      const activeConfig = Array.isArray(responseData)
        ? responseData.find((config: any) => config.status === 'active') || responseData[0]
        : undefined;
      const configValue = activeConfig?.config_value ?? null;

      if (response.ok && configValue) {
        setConfigData(configValue);
        localStorage.setItem('active_config', JSON.stringify(configValue));
        return configValue;
      }

      return null;
    } catch (error) {
      console.error('Failed to fetch active config:', error);
      return null;
    } finally {
      setConfigLoading(false);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const storedConfig = localStorage.getItem('active_config');
      if (storedConfig) {
        try {
          setConfigData(JSON.parse(storedConfig));
        } catch (error) {
          console.error('Failed to parse cached config:', error);
        }
      }

      const storedUser: any = localStorage.getItem('user');
      if (!storedUser) {
        setLoading(false);
        return;
      }

      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('parsedUser', parsedUser);
        if (parsedUser?.roles?.admin) {
          setIsAuthenticated(true);
          setRole('admin');
          await refreshConfig();
        } else if (parsedUser?.roles?.user) {
          setIsAuthenticated(true);
          setRole('user');
          await refreshConfig();
        }
      } catch (error) {
        console.error('Failed to parse user session:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (role: string) => {
    setIsAuthenticated(true);
    setRole(role);
    await refreshConfig();
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('active_config');
    setIsAuthenticated(false);
    setRole('');
    setConfigData(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, role, configData, configLoading, login, refreshConfig, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
