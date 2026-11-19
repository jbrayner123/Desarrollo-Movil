# Challenge 09: Mapas con Leaflet y Sensores Nativos de Capacitor

Aplicacion movil desarrollada con **Ionic Framework** (`@ionic/react`), **TypeScript**, **Capacitor**, **Leaflet** (`react-leaflet`) y **OpenCage Data**, correspondiente al **Challenge 09** del curso de *Desarrollo de Software para Plataformas Moviles*.

La aplicacion muestra la ubicacion del usuario en un mapa, registra rutas mediante seguimiento GPS y las integra con los sensores del dispositivo: verificacion de red antes de consultar servicios externos, respuesta haptica al iniciar y detener el seguimiento, parada automatica por bateria baja y un historial de rutas persistido en formato JSON.

---

## 1. Instalacion de Plugins

```bash
# Mapa
npm install leaflet react-leaflet
npm install -D @types/leaflet

# Plugins oficiales de Capacitor
npm install @capacitor/geolocation @capacitor/network @capacitor/haptics @capacitor/device @capacitor/preferences

# Sincronizar con el proyecto nativo
npx cap sync android
```

---

## 2. Arquitectura de Directorios (`src/`)

```text
├── android/                           <-- Proyecto nativo Android (Capacitor)
│   └── app/src/main/AndroidManifest.xml   <-- Permisos de Ubicacion, Red, Internet y Vibracion
├── src/
│   ├── components/
│   │   ├── MapComponent.tsx           <-- Orquestador: integra mapa, sensores, historial y avisos
│   │   ├── LeafletMap.tsx             <-- Mapa Leaflet: posicion, ruta activa y ruta del historial
│   │   ├── SensorStatusCard.tsx       <-- Estado de red, bateria, GPS, puntos y distancia
│   │   └── RouteHistoryModal.tsx      <-- Modal de historial con detalle, JSON y ver en mapa
│   ├── hooks/
│   │   ├── useNetworkStatus.ts        <-- @capacitor/network: estado reactivo y verificacion puntual
│   │   ├── useHaptics.ts              <-- @capacitor/haptics: vibracion de inicio y fin
│   │   ├── useBatteryMonitor.ts       <-- @capacitor/device: sondeo de bateria y umbral del 15%
│   │   ├── useGeolocation.ts          <-- @capacitor/geolocation: posicion actual y watchPosition
│   │   ├── useReverseGeocoding.ts     <-- OpenCage con verificacion de red y respaldo en coordenadas
│   │   └── useRouteHistory.ts         <-- Estado React del historial persistido
│   ├── services/
│   │   ├── geocodingService.ts        <-- Cliente HTTP de OpenCage Data (geocodificacion inversa)
│   │   └── routeStorageService.ts     <-- CRUD JSON sobre @capacitor/preferences y calculo Haversine
│   ├── config/constants.ts            <-- Umbral de bateria, intervalos, claves y centro por defecto
│   ├── types/index.ts                 <-- Interfaces Coordenada, SesionRuta y EstadoBateria
│   ├── utils/format.ts                <-- Formato de fecha, hora, distancia y duracion
│   ├── pages/MapPage.tsx              <-- Pantalla principal
│   ├── theme/variables.css            <-- Tema plano: neutros, bordes sutiles, primario azul marino
│   ├── App.tsx                        <-- Enrutador Ionic
│   └── main.tsx                       <-- Punto de entrada
├── .env.example                       <-- Plantilla para VITE_OPENCAGE_API_KEY
├── capacitor.config.ts                <-- appId: com.desarrollomovil.mapassensores
└── challenger-09-debug.apk            <-- APK de pruebas para Android
```

---

## 3. Funcionalidades Implementadas

### A. Verificacion de Red (`@capacitor/network`)
- `useNetworkStatus` mantiene el estado con `Network.getStatus()` y el listener `networkStatusChange`.
- Antes de consultar OpenCage o de recargar el mapa se llama a `verificarConexion()`.
- Sin conexion se muestra un aviso sobrio en pantalla, no se consulta la API y la direccion se muestra como coordenadas.

### B. Respuesta Haptica (`@capacitor/haptics`)
- `startTracking`: impacto medio y vibracion corta (150 ms).
- `stopTracking`: impacto fuerte y vibracion algo mas larga (300 ms) para diferenciar ambos eventos.

### C. Monitoreo de Bateria (`@capacitor/device`)
- `Device.getBatteryInfo()` se consulta cada 30 segundos mientras el seguimiento esta activo.
- Si el nivel baja del **15 %** y el telefono no esta cargando, el seguimiento se detiene automaticamente, la ruta se guarda y se muestra un mensaje informativo.
- Tampoco se permite iniciar un seguimiento con la bateria por debajo del umbral.

### D. Historial de Rutas en JSON (`@capacitor/preferences`)
Cada sesion se guarda como un objeto dentro de un arreglo JSON bajo la clave `challenge09_historial_rutas`:

```json
{
  "id": "1795054832139",
  "fecha": "18/11/2026",
  "horaInicio": "21:20:32",
  "horaFin": "21:20:37",
  "inicioISO": "2026-11-19T02:20:32.139Z",
  "finISO": "2026-11-19T02:20:37.470Z",
  "coordenadas": [{ "lat": 3.4516, "lng": -76.532, "precision": 10, "timestamp": 1795054827215 }],
  "direccionInicio": "Carrera 4, Cali, Colombia",
  "direccionFin": "Calle 13, Cali, Colombia",
  "distanciaMetros": 333,
  "duracionSegundos": 5,
  "motivoFin": "manual"
}
```

El modal **Historial** lista las sesiones con fecha, hora, distancia, duracion y direcciones, y permite ver el JSON, dibujar la ruta sobre el mapa (linea punteada) o eliminarla.

### E. Geocodificacion Inversa (OpenCage Data)
- `geocodingService.obtenerDireccion(lat, lng)` consulta `api.opencagedata.com/geocode/v1/json` en espanol.
- Se resuelve la direccion de la posicion actual, del primer punto y del ultimo punto de cada ruta.

---

## 4. Ejecucion

```bash
npm install
cp .env.example .env        # y colocar la clave de OpenCage en VITE_OPENCAGE_API_KEY
npm run dev                 # http://localhost:5176
```

### Compilar el APK

```bash
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug
```

> La clave de OpenCage se incluye al compilar (`npm run build`). Si el APK se genera sin `.env`, la aplicacion funciona igual pero muestra las direcciones como coordenadas.

---

## 5. Lineamientos de Diseno

- Sin emojis ni gradientes; colores neutros, bordes de 1 px y un primario azul marino solido (`#1f2a44`).
- Componentes nativos de Ionic (`IonCard`, `IonButton`, `IonBadge`, `IonModal`, `IonToast`) en modo `md` para un aspecto plano.
- Avisos con borde lateral en lugar de fondos de color intensos.

---

## Estudiante

- **Estudiante**: Jose Brayner Minotta
- **Asignatura**: Desarrollo de Aplicaciones Web y Moviles
- **Repositorio**: [https://github.com/jbrayner123/Desarrollo-Movil](https://github.com/jbrayner123/Desarrollo-Movil)
