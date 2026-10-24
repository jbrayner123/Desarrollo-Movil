import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  avatarUrl: string | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, nombre: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateAvatarFromUrl: (url: string) => void;
  loadUserAvatar: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const loadUserAvatar = async (userId: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('avatars')
        .list(userId, {
          limit: 10,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) {
        console.warn('No se pudieron listar avatares de storage:', error.message);
        return;
      }

      if (data && data.length > 0) {
        // Encontrar el archivo mas reciente
        const latest = data[0];
        const path = `${userId}/${latest.name}`;
        const { data: publicData } = supabase.storage.from('avatars').getPublicUrl(path);
        if (publicData?.publicUrl) {
          setAvatarUrl(publicData.publicUrl);
        }
      } else {
        setAvatarUrl(null);
      }
    } catch (err) {
      console.error('Error al cargar avatar:', err);
    }
  };

  useEffect(() => {
    let mounted = true;

    // 1. Obtener sesion inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user?.id) {
        loadUserAvatar(session.user.id);
      }
      setLoading(false);
    }).catch((err) => {
      console.error('Error al inicializar sesion de Supabase:', err);
      if (mounted) setLoading(false);
    });

    // 2. Escuchar cambios de estado en Auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user?.id) {
        loadUserAvatar(session.user.id);
      } else {
        setAvatarUrl(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { error };
  };

  const signUp = async (email: string, password: string, nombre: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          nombre
        }
      }
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setAvatarUrl(null);
  };

  const updateAvatarFromUrl = (url: string) => {
    setAvatarUrl(url);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        avatarUrl,
        signIn,
        signUp,
        signOut,
        updateAvatarFromUrl,
        loadUserAvatar
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
