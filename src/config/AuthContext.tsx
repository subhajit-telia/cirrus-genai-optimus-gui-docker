import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useHistory } from 'react-router-dom';

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  role: string;
  login: (role: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [role, setRole] = useState<string>('');
  const history = useHistory();

  useEffect(() => {
    const storedUser:any = localStorage.getItem('user');
    const parsedUser = JSON.parse(storedUser);
    console.log('parsedUser', parsedUser);
    if (parsedUser && parsedUser.roles.admin) {
      setIsAuthenticated(true);
      setRole('admin');
    }else if (parsedUser && parsedUser.roles.user) {
      setIsAuthenticated(true);
      setRole('user');
    }
    setLoading(false);
  }, []);

  const login = (role: string) => {
    setIsAuthenticated(true);
    setRole(role);
  };

  const logout = () => {
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setRole('');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, role, login, logout }}>
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
