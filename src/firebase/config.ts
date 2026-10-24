// src/firebase/config.ts
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getDatabase, Database } from 'firebase/database';

/**
 * =========================================================================
 * CONFIGURACION DE FIREBASE (Challenge 06)
 * =========================================================================
 * Soporta Firebase Auth, Cloud Firestore y Realtime Database.
 * Para conectar con tu propia consola de Firebase:
 * 1. Ve a https://console.firebase.google.com/
 * 2. Selecciona o crea tu proyecto.
 * 3. En "Authentication" -> "Sign-in method", activa "Correo electronico/contrasena".
 * 4. En "Firestore Database", crea la base de datos (modo prueba).
 * 5. En "Realtime Database", crea la base de datos (modo prueba).
 * 6. Copia los valores de tu objeto firebaseConfig y pegalos abajo:
 */
const firebaseConfig = {
  apiKey: "AIzaSyDemoPlaceholderKey_ColocaTuApiKeyAqui",
  authDomain: "task-manager-movil-ch05.firebaseapp.com",
  databaseURL: "https://task-manager-movil-ch05-default-rtdb.firebaseio.com",
  projectId: "task-manager-movil-ch05",
  storageBucket: "task-manager-movil-ch05.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

// Inicializacion de la aplicacion Firebase (patron Singleton para evitar multiples instancias)
export const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Inicializacion del servicio modular de autenticacion
export const auth: Auth = getAuth(app);

// Inicializacion del servicio modular de Cloud Firestore
export const db: Firestore = getFirestore(app);

// Inicializacion del servicio modular de Realtime Database
export const rtdb: Database = getDatabase(app);

