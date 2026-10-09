// src/firebase/config.ts
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

/**
 * =========================================================================
 * ⚙️ CONFIGURACIÓN DE FIREBASE (Challenge 05)
 * =========================================================================
 * Para conectar con tu propia consola de Firebase:
 * 1. Ve a https://console.firebase.google.com/
 * 2. Selecciona o crea tu proyecto.
 * 3. En la sección "Authentication" -> "Sign-in method", activa "Correo electrónico/contraseña".
 * 4. Ve a Configuración del Proyecto (icono de engranaje) -> General -> Tus apps -> Web (</>).
 * 5. Copia los valores de tu objeto firebaseConfig y pégalos aquí abajo:
 */
const firebaseConfig = {
  apiKey: "AIzaSyDemoPlaceholderKey_ColocaTuApiKeyAqui",
  authDomain: "task-manager-movil-ch05.firebaseapp.com",
  projectId: "task-manager-movil-ch05",
  storageBucket: "task-manager-movil-ch05.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

// Inicialización de la aplicación Firebase (patrón Singleton para evitar múltiples instancias)
export const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Inicialización del servicio modular de autenticación
export const auth: Auth = getAuth(app);
