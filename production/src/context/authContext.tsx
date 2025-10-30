// src/context/AuthContext.tsx

import React, { createContext, useState, useContext, ReactNode } from 'react';
import * as authService from '../api/authService';
import { User } from '../types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
});

interface AuthProviderProps {
  children: ReactNode;
  isAuthenticated: boolean;
}

export const AuthProvider = ({ children, isAuthenticated: initialIsAuthenticated }: AuthProviderProps) => {
  const [authState] = useState<AuthContextType>(() => {
    // Initialisation synchrone basée sur la prop
    if (initialIsAuthenticated) {
      const userProfile = authService.getUserProfile();
      return { isAuthenticated: true, user: userProfile };
    }
    return { isAuthenticated: false, user: null };
  });

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};