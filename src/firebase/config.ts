// parcial-02/src/firebase/config.ts
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, doc, setDoc, getDoc, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import type { UserProgressData, LeaderboardUser } from '../types';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoPlaceholderKey_Parcial2Misiones",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "parcial2-misiones-movil.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "parcial2-misiones-movil",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "parcial2-misiones-movil.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "987654321098",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:987654321098:web:abcdef9876543210"
};

// Singleton Firebase App
export const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

// Competidores predeterminados de seed para el Top 5
export const DEFAULT_COMPETITORS: LeaderboardUser[] = [
  { uid: 'comp-1', displayName: 'Valeria Mendoza', email: 'valeria.m@meetgen.dev', points: 130, completedCount: 3 },
  { uid: 'comp-2', displayName: 'Carlos Restrepo', email: 'carlos.r@meetgen.dev', points: 100, completedCount: 2 },
  { uid: 'comp-3', displayName: 'Mateo Guerrero', email: 'mateo.g@meetgen.dev', points: 70, completedCount: 1 },
  { uid: 'comp-4', displayName: 'Sofia Torres', email: 'sofia.t@meetgen.dev', points: 30, completedCount: 1 }
];

const LOCAL_STORAGE_USERS_KEY = 'parcial02_ranking_users';

/**
 * Guarda el progreso en Firestore con fallback a LocalStorage
 */
export async function syncProgressToFirebase(
  uid: string,
  displayName: string,
  email: string,
  data: UserProgressData
): Promise<void> {
  const payload = {
    uid,
    displayName,
    email,
    points: data.points,
    missions: data.missions,
    updatedAt: new Date().toISOString()
  };

  // 1. Guardar en LocalStorage siempre para persistencia dual inmediata
  try {
    const rawLocal = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
    const usersMap: Record<string, any> = rawLocal ? JSON.parse(rawLocal) : {};
    usersMap[uid] = payload;
    localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(usersMap));
  } catch (err) {
    console.warn('Error guardando en localStorage ranking:', err);
  }

  // 2. Intentar guardar en Firestore
  try {
    const userDocRef = doc(db, 'users', uid);
    await setDoc(userDocRef, payload, { merge: true });
  } catch (err) {
    console.warn('Aviso: Firestore offline o demo, persistiendo localmente:', err);
  }
}

/**
 * Carga el progreso del usuario desde Firestore con fallback a LocalStorage
 */
export async function loadProgressFromFirebase(uid: string): Promise<UserProgressData | null> {
  try {
    const userDocRef = doc(db, 'users', uid);
    const snapshot = await getDoc(userDocRef);
    if (snapshot.exists()) {
      const d = snapshot.data();
      return {
        points: Number(d.points) || 0,
        missions: Array.isArray(d.missions) ? d.missions : []
      };
    }
  } catch (err) {
    console.warn('Aviso: No se pudo conectar a Firestore, verificando LocalStorage:', err);
  }

  // Fallback LocalStorage
  try {
    const raw = localStorage.getItem(`parcial02_progress_${uid}`);
    if (raw) return JSON.parse(raw) as UserProgressData;
  } catch (e) {
    console.warn('Error leyendo de localStorage:', e);
  }

  return null;
}

/**
 * Consulta el Top 5 de usuarios asegurando que existan competidores
 */
export async function fetchTop5Ranking(currentUid: string, currentPoints: number, currentName: string, currentEmail: string): Promise<LeaderboardUser[]> {
  const usersMap: Map<string, LeaderboardUser> = new Map();

  // 1. Cargar competidores base de seed
  DEFAULT_COMPETITORS.forEach((c) => usersMap.set(c.uid, { ...c }));

  // 2. Cargar usuarios locales
  try {
    const rawLocal = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
    if (rawLocal) {
      const parsed: Record<string, any> = JSON.parse(rawLocal);
      Object.values(parsed).forEach((u: any) => {
        usersMap.set(u.uid, {
          uid: u.uid,
          displayName: u.displayName || 'Agente',
          email: u.email || '',
          points: Number(u.points) || 0,
          completedCount: Array.isArray(u.missions) ? u.missions.filter((m: any) => m.completed).length : 0
        });
      });
    }
  } catch (e) {
    console.warn('Error leyendo ranking local:', e);
  }

  // 3. Intentar consultar usuarios reales de Firestore (con timeout de 1.2s para evitar bloquear)
  try {
    const usersCol = collection(db, 'users');
    const q = query(usersCol, orderBy('points', 'desc'), limit(10));
    const firestoreQueryPromise = getDocs(q);
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1200));
    const snapshot = await Promise.race([firestoreQueryPromise, timeoutPromise]);
    if (snapshot && 'forEach' in snapshot) {
      snapshot.forEach((docSnap) => {
        const u = docSnap.data();
        usersMap.set(docSnap.id, {
          uid: docSnap.id,
          displayName: u.displayName || 'Agente',
          email: u.email || '',
          points: Number(u.points) || 0,
          completedCount: Array.isArray(u.missions) ? u.missions.filter((m: any) => m.completed).length : 0
        });
      });
    }
  } catch (err) {
    console.warn('Firestore offline o consulta de ranking simulada:', err);
  }

  // 4. Asegurar que el usuario actual este presente y actualizado
  if (currentUid) {
    const existing = usersMap.get(currentUid);
    usersMap.set(currentUid, {
      uid: currentUid,
      displayName: currentName || existing?.displayName || 'Mi Usuario',
      email: currentEmail || existing?.email || '',
      points: currentPoints,
      completedCount: existing?.completedCount || 0,
      isCurrentUser: true
    });
  }

  // 5. Ordenar descendentemente por puntos y extraer Top 5
  const sorted = Array.from(usersMap.values()).sort((a, b) => b.points - a.points);
  const top5 = sorted.slice(0, 5).map((user, index) => ({
    ...user,
    rank: index + 1,
    isCurrentUser: user.uid === currentUid
  }));

  return top5;
}
