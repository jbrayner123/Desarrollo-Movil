import { initializeApp } from 'firebase/app';
import { indexedDBLocalPersistence, initializeAuth, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, Timestamp } from 'firebase/firestore';

/**
 * Cliente de Firebase (Auth + Firestore) configurado con variables de entorno.
 * La sesion persiste en IndexedDB, que funciona tanto en el navegador como en el
 * WebView de Android (Capacitor).
 */

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const isFirebaseConfigured = Boolean(config.apiKey && config.projectId);

export const app = initializeApp(config);

export const auth = initializeAuth(app, {
  persistence: [indexedDBLocalPersistence, browserLocalPersistence]
});

export const db = getFirestore(app);

/** Convierte un Timestamp de Firestore (o null mientras se confirma) en fecha ISO. */
export function toIso(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === 'string') return value;
  return new Date().toISOString();
}
