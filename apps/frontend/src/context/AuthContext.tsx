import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, userApi } from '../services/api';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'STUDENT' | 'ADMIN' | 'TEACHER' | 'AI_REVIEWER';
  targetYear?: number;
  studyStats?: {
    currentStreak: number;
    totalTestsTaken: number;
    totalStudyHours: number;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'));
  const [loading, setLoading] = useState<boolean>(true);

  const fetchMe = async () => {
    try {
      if (token) {
        const userData = await userApi.getMe();
        setUser(userData);
      }
    } catch (err) {
      console.error('Failed to load user profile', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMe();
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email: string, pass: string) => {
    const res = await authApi.login({ email, password: pass });
    localStorage.setItem('access_token', res.accessToken);
    setToken(res.accessToken);
    setUser(res.user);
  };

  const register = async (data: any) => {
    const res = await authApi.register(data);
    localStorage.setItem('access_token', res.accessToken);
    setToken(res.accessToken);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser: fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}