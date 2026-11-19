import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User
} from 'firebase/auth';
import { doc, getDoc, onSnapshot, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { auth, db, toIso } from '../lib/firebase';
import type { Role, UserProfile } from '../types';
import { createPet, type NewPet } from './pets.service';
import { createBusiness, type NewBusiness } from './businesses.service';

/** Registro: datos comunes + datos segun el tipo de cuenta. */
export type RegisterInput =
  | { role: 'owner'; displayName: string; email: string; password: string; pet: NewPet }
  | { role: 'vet' | 'petshop'; displayName: string; email: string; password: string; business: NewBusiness };

const profileRef = (uid: string) => doc(db, 'users', uid);

function mapProfile(uid: string, data: Record<string, unknown>): UserProfile {
  return {
    uid,
    role: (data.role as Role) ?? 'owner',
    displayName: (data.displayName as string) ?? '',
    email: (data.email as string) ?? '',
    photoUrl: (data.photoUrl as string) ?? '',
    city: (data.city as string) ?? 'Cali, Colombia',
    createdAt: toIso(data.createdAt)
  };
}

/**
 * Crea la cuenta en Firebase Auth, el perfil en users/{uid} y, segun el rol,
 * la mascota principal o el negocio. El perfil va primero porque las reglas
 * leen el rol para autorizar la creacion del negocio.
 */
export async function register(input: RegisterInput): Promise<void> {
  const { user } = await createUserWithEmailAndPassword(auth, input.email.trim(), input.password);
  await updateProfile(user, { displayName: input.displayName.trim() });

  const photoUrl = input.role === 'owner' ? input.pet.photoUrl : input.business.logoUrl;
  await setDoc(profileRef(user.uid), {
    uid: user.uid,
    role: input.role,
    displayName: input.displayName.trim(),
    email: input.email.trim().toLowerCase(),
    photoUrl: photoUrl ?? '',
    city: 'Cali, Colombia',
    createdAt: serverTimestamp()
  });

  if (input.role === 'owner') await createPet(user.uid, input.pet);
  else await createBusiness(user.uid, input.role, input.business);
}

export const login = (email: string, password: string) => signInWithEmailAndPassword(auth, email.trim(), password);

export const logout = () => signOut(auth);

export async function fetchProfile(user: User): Promise<UserProfile | null> {
  const snap = await getDoc(profileRef(user.uid));
  return snap.exists() ? mapProfile(user.uid, snap.data()) : null;
}

/** Escucha el perfil en vivo (por ejemplo, si el admin cambia el rol). */
export function subscribeProfile(uid: string, onChange: (p: UserProfile | null) => void, onError: (e: Error) => void) {
  return onSnapshot(profileRef(uid), (snap) => onChange(snap.exists() ? mapProfile(uid, snap.data()) : null), onError);
}

export async function updateMyProfile(uid: string, data: Partial<Pick<UserProfile, 'displayName' | 'photoUrl'>>) {
  await updateDoc(profileRef(uid), data);
  if (data.displayName && auth.currentUser) await updateProfile(auth.currentUser, { displayName: data.displayName });
}

/** Traduce los codigos de error de Firebase Auth a mensajes en espanol. */
export function authErrorMessage(error: unknown): string {
  const code = error instanceof FirebaseError ? error.code : '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Correo o contraseña incorrectos.';
    case 'auth/email-already-in-use':
      return 'Ya existe una cuenta con este correo.';
    case 'auth/invalid-email':
      return 'El correo no es válido.';
    case 'auth/weak-password':
      return 'La contraseña es muy débil. Usa al menos 8 caracteres.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Espera unos minutos e intenta de nuevo.';
    case 'auth/network-request-failed':
      return 'Sin conexión. Revisa tu internet e intenta de nuevo.';
    case 'permission-denied':
      return 'No tienes permisos para realizar esta acción.';
    default:
      return error instanceof Error && error.message ? error.message : 'Ocurrió un error inesperado.';
  }
}
