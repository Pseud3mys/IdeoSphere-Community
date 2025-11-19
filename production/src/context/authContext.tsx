// src/context/authContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import * as authService from '../api/authService';
import { User } from '../types';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: () => Promise<void>;
  register: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        // Lancement de la vérification SSO
        const isAuth = await authService.initAuth();
        
        setIsAuthenticated(isAuth);
        if (isAuth) {
          setUser(authService.getUserProfile());
        }
      } catch (error) {
        console.error('[AuthProvider] Erreur lors de l\'initialisation:', error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const login = async () => {
    await authService.loginWithSSO();
  };

  const register = async () => {
    await authService.registerWithSSO();
  };

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);