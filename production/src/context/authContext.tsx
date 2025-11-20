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
        console.log('🔄 [AuthContext] Vérification de la session...');
        
        // 1. Initialisation technique (Keycloak ou Mock)
        const isAuth = await authService.initAuth();
        setIsAuthenticated(isAuth);

        if (isAuth) {
          // 2. ÉTAPE CLÉ : On synchronise pour avoir le profil COMPLET (avec createdAt...)
          // Au lieu de setUser(authService.getUserProfile()) qui était incomplet
          const fullUser = await authService.syncUserSession();
          
          if (fullUser) {
            setUser(fullUser);
            console.log('✅ [AuthContext] Session active pour :', fullUser.name);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('[AuthProvider] Erreur lors de l\'initialisation:', error);
        setUser(null);
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