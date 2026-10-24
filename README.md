# Challenge 07: Laboratorio de Sensores Nativos (Hardware Telemetry)

Aplicacion movil desarrollada con **Ionic Framework** (`@ionic/react`), **TypeScript** y **Capacitor**, correspondiente al **Challenge 07** del curso de *Desarrollo de Software para Plataformas Moviles* (Prof. Jonathan Lopez).

El proyecto implementa una arquitectura desacoplada donde cada sensor nativo cuenta con su propio **Custom Hook** y su propia **pantalla dedicada de pruebas**, integrando un panel de control principal (`Home.tsx`) y compilacion nativa para Android (`.apk`).

---

## 1. Arquitectura de Directorios (`challenger-07/src/`)

```text
challenger-07/
├── android/                         <-- Proyecto nativo Android generado con Capacitor
│   └── app/src/main/AndroidManifest.xml <-- Permisos de GPS, camara, vibracion, notificaciones
├── challenger-07-debug.apk          <-- APK de depuracion compilado para pruebas fisicas
├── src/
│   ├── hooks/
│   │   ├── useGeolocation.ts        <-- @capacitor/geolocation (GPS puntual y tracking en vivo)
│   │   ├── useCamera.ts             <-- @capacitor/camera (Captura y galeria con URI web)
│   │   ├── useAccelerometer.ts      <-- @capacitor/motion (Telemetria triaxial y detector Shake)
│   │   ├── useDevice.ts             <-- @capacitor/device (Bateria, modelo, OS y UUID)
│   │   ├── useHaptics.ts            <-- @capacitor/haptics (Impactos, notificaciones y vibracion)
│   │   ├── useFilesystem.ts         <-- @capacitor/filesystem (Lectura, escritura y carpetas)
│   │   ├── useLocalNotifications.ts <-- @capacitor/local-notifications (Inmediata y programada)
│   │   ├── usePushNotifications.ts  <-- @capacitor/push-notifications (Token FCM y eventos)
│   │   └── useNetwork.ts            <-- @capacitor/network (Sensor de conectividad)
│   ├── pages/
│   │   ├── Home.tsx                 <-- Panel de control principal (Grid de sensores)
│   │   ├── GeolocationPage.tsx      <-- Prueba de geoposicionamiento y telemetria
│   │   ├── CameraPage.tsx           <-- Visor y captura de camara/galeria
│   │   ├── AccelerometerPage.tsx    <-- Telemetria X/Y/Z y alerta de Shake
│   │   ├── DevicePage.tsx           <-- Ficha tecnica de hardware y bateria
│   │   ├── HapticsPage.tsx          <-- Consola de retroalimentacion haptica
│   │   ├── FilesystemPage.tsx       <-- Explorador y editor de archivos en Documents
│   │   ├── LocalNotificationsPage.tsx <-- Programador y disparador de notificaciones
│   │   ├── PushNotificationsPage.tsx  <-- Visualizador de Token FCM y mensajes
│   │   └── NetworkPage.tsx          <-- Telemetria de interfaz de red activa
│   ├── theme/
│   │   └── variables.css            <-- Estetica tecnica de telemetria de hardware
│   ├── App.tsx                      <-- Enrutador con IonReactRouter y rutas dedicadas
│   └── main.tsx                     <-- Punto de entrada e inicializacion
├── capacitor.config.ts              <-- Configuracion de Capacitor (appId: com.desarrollomovil.sensoreslab)
├── package.json                     <-- Dependencias de Ionic, React y plugins nativos
└── vite.config.ts                   <-- Configuracion de Vite bundler
```

---

## 2. Sensores Implementados y Custom Hooks

| Sensor / Plugin | Custom Hook | Funcionalidad Clave |
| :--- | :--- | :--- |
| **@capacitor/geolocation** | `useGeolocation` | `getCurrentLocation()`, `startTracking()` de alta precision y `stopTracking()` con `clearWatch`. |
| **@capacitor/camera** | `useCamera` | `takePhoto()` con `CameraResultType.Uri` y selector de fuente (camara o galeria). |
| **@capacitor/motion** | `useAccelerometer` | Telemetria triaxial (X, Y, Z), magnitud euclidea y detector de agitacion `isShaking` (`threshold: 22`). |
| **@capacitor/device** | `useDevice` | Nivel y estado de carga de bateria (`batteryLevel * 100`), info de OS y UUID del dispositivo. |
| **@capacitor/haptics** | `useHaptics` | `impact()` (`light`, `medium`, `heavy`), `notify()` (`success`, `warning`, `error`), `vibrate(200ms)` y pulsos de seleccion. |
| **@capacitor/filesystem** | `useFilesystem` | `writeFile`, `readFile`, `deleteFile`, `listFiles`, `createDir` y `deleteDir` en `Directory.Documents`. |
| **@capacitor/local-notifications** | `useLocalNotifications` | Permisos nativos, envio inmediato y programacion temporal en segundos (`schedule`). |
| **@capacitor/push-notifications** | `usePushNotifications` | Registro FCM, copia de registration token y recepcion de notificaciones. |
| **@capacitor/network** | `useNetwork` | Deteccion de estado online/offline y tipo de interfaz (Wi-Fi, Celular). |

---

## 3. Permisos Configurados en `AndroidManifest.xml`

```xml
<!-- Geolocation -->
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />

<!-- Camera & Storage -->
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />

<!-- Haptics -->
<uses-permission android:name="android.permission.VIBRATE" />

<!-- Notifications -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
```

---

## 4. Instrucciones de Compilacion y Ejecucion

```bash
# Entrar a la carpeta del reto
cd challenger-07

# 1. Instalar dependencias
npm install

# 2. Servidor web de desarrollo
npm run dev

# 3. Compilar bundle web
npm run build

# 4. Sincronizar con plataforma Android
npx cap sync android

# 5. Compilar APK de depuracion
cd android
./gradlew assembleDebug

# El APK queda ubicado en:
# challenger-07/android/app/build/outputs/apk/debug/app-debug.apk
# challenger-07/challenger-07-debug.apk
```
