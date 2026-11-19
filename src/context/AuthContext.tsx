import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import * as authService from '../services/auth.service';
import { subscribeMyPets } from '../services/pets.service';
import { subscribeBusiness } from '../services/businesses.service';
import type { Business, Pet, Role, UserProfile } from '../types';

/**
 * Sesion con Firebase Auth.
 * - Escucha onAuthStateChanged (la sesion persiste al cerrar la app).
 * - Carga en vivo el perfil (users/{uid}) con el rol, y segun el rol la mascota
 *   principal o el negocio.
 */

type Status = 'loading' | 'signedOut' | 'ready' | 'missingProfile';

/** Como se muestra la cuenta en publicaciones y chats. */
export interface Identity {
  name: string;
  photo: string;
  role: Role;
}

interface AuthContextValue {
  status: Status;
  user: UserProfile | null;
  pet: Pet | null;
  business: Business | null;
  isAdmin: boolean;
  isBusiness: boolean;
  identity: Identity | null;
  login: (email: string, password: string) => Promise<void>;
  register: (input: authService.RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null | undefined>(undefined);
  const [profile, setProfile] = useState<UserProfile | null | undefined>(undefined);
  const [pet, setPet] = useState<Pet | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);

  useEffect(() => onAuthStateChanged(auth, (u) => setFirebaseUser(u)), []);

  // Perfil en vivo del usuario autenticado.
  useEffect(() => {
    if (!firebaseUser) {
      setProfile(firebaseUser === null ? null : undefined);
      return;
    }
    setProfile(undefined);
    return authService.subscribeProfile(firebaseUser.uid, setProfile, () => setProfile(null));
  }, [firebaseUser]);

  // Mascota principal (duenos) o negocio (veterinarias y petshops).
  useEffect(() => {
    setPet(null);
    setBusiness(null);
    if (!profile) return;
    if (profile.role === 'owner' || profile.role === 'admin') {
      return subscribeMyPets(profile.uid, (list) => setPet(list[0] ?? null), () => setPet(null));
    }
    return subscribeBusiness(profile.uid, setBusiness, () => setBusiness(null));
  }, [profile?.uid, profile?.role]);

  // Justo despues de registrarse el perfil tarda un instante en existir: se espera
  // unos segundos antes de declararlo faltante.
  const [graceOver, setGraceOver] = useState(false);
  useEffect(() => {
    setGraceOver(false);
    if (firebaseUser && profile === null) {
      const id = window.setTimeout(() => setGraceOver(true), 6000);
      return () => window.clearTimeout(id);
    }
  }, [firebaseUser, profile]);

  const status: Status =
    firebaseUser === undefined
      ? 'loading'
      : firebaseUser === null
        ? 'signedOut'
        : profile
          ? 'ready'
          : profile === null && graceOver
            ? 'missingProfile'
            : 'loading';

  const login = useCallback(async (email: string, password: string) => {
    await authService.login(email, password);
  }, []);

  const register = useCallback((input: authService.RegisterInput) => authService.register(input), []);
  const logout = useCallback(() => authService.logout(), []);

  const identity = useMemo<Identity | null>(() => {
    if (!profile) return null;
    if (profile.role === 'vet' || profile.role === 'petshop') {
      return { name: business?.name || profile.displayName, photo: business?.logoUrl || profile.photoUrl, role: profile.role };
    }
    return {
      name: pet ? `${profile.displayName.split(' ')[0]} & ${pet.name}` : profile.displayName,
      photo: pet?.photoUrl || profile.photoUrl,
      role: profile.role
    };
  }, [profile, pet, business]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user: profile ?? null,
      pet,
      business,
      isAdmin: profile?.role === 'admin',
      isBusiness: profile?.role === 'vet' || profile?.role === 'petshop',
      identity,
      login,
      register,
      logout
    }),
    [status, profile, pet, business, identity, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
