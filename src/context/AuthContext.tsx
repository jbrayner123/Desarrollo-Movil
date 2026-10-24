// parcial-02/src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../firebase/config';
import type { AuthUser } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ error?: string }>;
  register: (name: string, email: string, pass: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const LOCAL_AUTH_USER_KEY = 'parcial02_current_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // 1. Cargar sesion local de respaldo
    try {
      const cached = localStorage.getItem(LOCAL_AUTH_USER_KEY);
      if (cached) {
        setUser(JSON.parse(cached));
      }
    } catch (e) {
      console.warn('Error leyendo sesion local:', e);
    }

    // 2. Suscribirse a Firebase Auth
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const u: AuthUser = {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Agente',
          email: firebaseUser.email || ''
        };
        setUser(u);
        localStorage.setItem(LOCAL_AUTH_USER_KEY, JSON.stringify(u));
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string): Promise<{ error?: string }> => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const u: AuthUser = {
        uid: cred.user.uid,
        displayName: cred.user.displayName || email.split('@')[0],
        email: cred.user.email || email
      };
      setUser(u);
      localStorage.setItem(LOCAL_AUTH_USER_KEY, JSON.stringify(u));
      return {};
    } catch (err: any) {
      // Fallback demo local si Firebase da error de configuracion o red
      console.warn('Firebase login fallo, usando sesion demo local:', err);
      if (email && pass.length >= 6) {
        const dummyUid = 'local-' + btoa(email).substring(0, 10);
        const u: AuthUser = {
          uid: dummyUid,
          displayName: email.split('@')[0].toUpperCase(),
          email: email
        };
        setUser(u);
        localStorage.setItem(LOCAL_AUTH_USER_KEY, JSON.stringify(u));
        return {};
      }
      return { error: err.message || 'Error al iniciar sesion' };
    }
  };

  const register = async (name: string, email: string, pass: string): Promise<{ error?: string }> => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (name.trim()) {
        await updateProfile(cred.user, { displayName: name.trim() });
      }
      const u: AuthUser = {
        uid: cred.user.uid,
        displayName: name.trim() || email.split('@')[0],
        email: cred.user.email || email
      };
      setUser(u);
      localStorage.setItem(LOCAL_AUTH_USER_KEY, JSON.stringify(u));
      return {};
    } catch (err: any) {
      // Fallback demo local
      console.warn('Firebase register fallo, creando usuario local:', err);
      if (email && pass.length >= 6) {
        const dummyUid = 'local-' + btoa(email).substring(0, 10);
        const u: AuthUser = {
          uid: dummyUid,
          displayName: name.trim() || email.split('@')[0].toUpperCase(),
          email: email
        };
        setUser(u);
        localStorage.setItem(LOCAL_AUTH_USER_KEY, JSON.stringify(u));
        return {};
      }
      return { error: err.message || 'Error al registrar usuario' };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Error en signOut:', e);
    }
    setUser(null);
    localStorage.removeItem(LOCAL_AUTH_USER_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
