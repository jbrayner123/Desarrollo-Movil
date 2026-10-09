// src/firebase/config.ts
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

/**
 * =========================================================================
 * CONFIGURACION DE FIREBASE (Challenge 05)
 * =========================================================================
 * Para conectar con tu propia consola de Firebase:
 * 1. Ve a https://console.firebase.google.com/
 * 2. Selecciona o crea tu proyecto.
 * 3. En la seccion "Authentication" -> "Sign-in method", activa "Correo electronico/contrasena".
 * 4. Ve a Configuracion del Proyecto -> General -> Tus apps -> Web (</>).
 * 5. Copia los valores de tu objeto firebaseConfig y pegalos aqui abajo:
 */
const firebaseConfig = {
  apiKey: "AIzaSyDemoPlaceholderKey_ColocaTuApiKeyAqui",
  authDomain: "task-manager-movil-ch05.firebaseapp.com",
  projectId: "task-manager-movil-ch05",
  storageBucket: "task-manager-movil-ch05.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

// Inicializacion de la aplicacion Firebase (patron Singleton para evitar multiples instancias)
export const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Inicializacion del servicio modular de autenticacion
export const auth: Auth = getAuth(app);
