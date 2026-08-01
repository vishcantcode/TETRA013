import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../api';
import { useToast } from '../components/Toast';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('hs_token');
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const data = await api.auth.me();
        setUser(data.user);
        localStorage.setItem('hs_user', JSON.stringify(data.user));
      } catch (err) {
        localStorage.removeItem('hs_token');
        localStorage.removeItem('hs_user');
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.auth.login(email, password);
    localStorage.setItem('hs_token', data.token);
    localStorage.setItem('hs_user', JSON.stringify(data.user));
    setUser(data.user);
    toast.success('Successfully logged in');
  };

  const register = async (data: any) => {
    const res = await api.auth.register(data);
    localStorage.setItem('hs_token', res.token);
    localStorage.setItem('hs_user', JSON.stringify(res.user));
    setUser(res.user);
    toast.success('Successfully registered');
  };

  const logout = () => {
    localStorage.removeItem('hs_token');
    localStorage.removeItem('hs_user');
    setUser(null);
    toast.info('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
