
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { User, UserRole } from '../types';
import { MOCK_USERS } from '../data/mock';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, pass: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for a logged-in user in local storage
    setTimeout(() => {
      const storedUser = localStorage.getItem('agrosync_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    }, 1000);
  }, []);

  const login = useCallback(async (email: string, pass: string): Promise<boolean> => {
    setLoading(true);
    // Simulate API call
    return new Promise(resolve => {
        setTimeout(() => {
            const foundUser = MOCK_USERS.find(u => u.email === email); // In a real app, also check hashed password
            if (foundUser) {
                setUser(foundUser);
                localStorage.setItem('agrosync_user', JSON.stringify(foundUser));
                resolve(true);
            } else {
                resolve(false);
            }
            setLoading(false);
        }, 1000);
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('agrosync_user');
    localStorage.removeItem('agrosync_farm'); // Also clear farm data on logout
  }, []);

  const register = useCallback(async (name: string, email: string, pass: string): Promise<boolean> => {
      setLoading(true);
      return new Promise(resolve => {
          setTimeout(() => {
              if (MOCK_USERS.some(u => u.email === email)) {
                  resolve(false); // User already exists
              } else {
                  const newUser: User = { id: `user_${Date.now()}`, name, email, role: UserRole.ADMIN };
                  MOCK_USERS.push(newUser); // In a real app, this would be a backend call
                  setUser(newUser);
                  localStorage.setItem('agrosync_user', JSON.stringify(newUser));
                  resolve(true);
              }
              setLoading(false);
          }, 1000);
      });
  }, []);

  const value = { 
    isAuthenticated: !!user, 
    user, 
    loading,
    login,
    logout,
    register
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
