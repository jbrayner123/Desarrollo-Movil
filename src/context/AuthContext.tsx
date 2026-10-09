// src/context/AuthContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth, AppUser } from '../hooks/useAuth';

// Tipado del valor que expone el contexto
export interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// 1. Creación del contexto de autenticación
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Proveedor de Autenticación que envuelve la aplicación
 * Mantiene el componente ultra-limpio consumiendo el custom hook useAuth
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook de conveniencia para consumir AuthContext en cualquier componente
 */
export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
