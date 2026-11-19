# Manada

**Red social y comunidad de mascotas en Cali.** Manada conecta a las familias con mascotas, las veterinarias y las tiendas de mascotas de la ciudad: permite compartir momentos y paseos, reportar mascotas perdidas, encontrar servicios cercanos en el mapa, calificar negocios y conversar en tiempo real.

Proyecto final de la asignatura **Desarrollo de Aplicaciones Web y Móviles**, construido con **Ionic React**, **TypeScript**, **Capacitor**, **Firebase**, **Leaflet** y sensores nativos del teléfono.

![Resumen de la aplicación](docs/screenshots/00-resumen.jpg)

---

## Contribuidores

Manada es un proyecto de **José Brayner Minotta Ruiz** y **Gabriela Chávez**, desarrollado entre los dos.

| Contribuidor | GitHub |
| :--- | :--- |
| **José Brayner Minotta Ruiz** | [@jbrayner123](https://github.com/jbrayner123) |
| **Gabriela Chávez** | [@Chavezgaby08](https://github.com/Chavezgaby08) |

- **Prototipo de diseño (Lovable):** _pendiente de agregar el enlace_
- **Rama del proyecto:** `proyecto-final`
- **Ramas mezcladas en `main`:** `proyecto-final`

---

## Contenido

1. [Contribuidores](#contribuidores)
2. [Qué hace la aplicación](#qué-hace-la-aplicación)
3. [Capturas de pantalla](#capturas-de-pantalla)
4. [Tecnologías](#tecnologías)
5. [Arquitectura del proyecto](#arquitectura-del-proyecto)
6. [Modelo de datos y seguridad](#modelo-de-datos-y-seguridad)
7. [Sensores nativos](#sensores-nativos)
8. [APIs y servicios consumidos](#apis-y-servicios-consumidos)
9. [Instalación y ejecución](#instalación-y-ejecución)
10. [Compilar el APK de Android](#compilar-el-apk-de-android)
11. [Cuentas de demostración](#cuentas-de-demostración)

---

## Qué hace la aplicación

### Tipos de cuenta

Al registrarse, cada persona elige cómo usará la app. El rol define qué puede publicar y qué ve en la barra inferior.

| Tipo | Qué puede hacer |
| :--- | :--- |
| **Dueño de mascota** | Registra su mascota; publica momentos, paseos, reportes de mascotas perdidas y tips; comenta, da me gusta, se une a paseos, califica negocios y chatea con cualquier cuenta. |
| **Veterinaria** | Tiene un perfil de negocio con dirección en el mapa, horario, teléfono y servicios; aparece en el directorio; publica tips y avisos; recibe reseñas y atiende consultas por chat. |
| **Petshop** | Igual que la veterinaria, pero publica promociones y aparece en la sección de tiendas. |
| **Administrador** | Modera los reportes de contenido y verifica los negocios. No se elige al registrarse: se asigna desde la consola de Firebase. |

### Funcionalidades principales

- **Feed en tiempo real** con cinco tipos de publicación: momentos (foto libre), paseos, mascotas perdidas, tips, avisos y promociones, con filtros, orden por recientes o populares, me gusta, comentarios y reportes.
- **Publicar con cámara y GPS:** la foto se toma con la cámara o la galería y se sube a Cloudinary; la ubicación se obtiene con el GPS y se convierte en una dirección legible.
- **Mascotas perdidas:** reporte con foto, nombre y ubicación, visible en el mapa y con notificación local para el resto de la comunidad.
- **Paseos:** cualquier dueño puede unirse a un paseo; la app avisa por chat al autor y programa un recordatorio.
- **Mapa de la comunidad** con la ubicación del usuario, mascotas perdidas, paseos, veterinarias y petshops, ordenados por distancia real.
- **Directorio de veterinarias y petshops** con porcentaje de recomendación, calificación, reseñas, distancia, verificación y botón "Cómo llegar".
- **Registro de negocios con dirección:** se puede escribir la dirección (sugerencias de OpenCage), usar la ubicación actual o arrastrar el pin en un mini mapa.
- **Chat en tiempo real** entre cualquier tipo de cuenta, con contador de no leídos y **ubicación compartida** en forma de tarjeta con mapa.
- **Perfil** con la ficha de la mascota (foto, raza, edad, peso, vacunas) y edición de datos.
- **Panel de negocio** con estado de verificación, métricas y edición del perfil.
- **Panel de administración** con métricas, moderación de reportes y verificación de negocios.
- **Funcionamiento sin conexión:** aviso de red, feed guardado en el teléfono y borradores de publicaciones para publicarlos al recuperar la conexión.

### Diseño

Diseño plano basado en el prototipo de Lovable: fondo neutro `#F7F8FA`, tarjetas blancas con bordes suaves, amarillo y azul sólidos, sin gradientes ni emojis y con iconos de [Ionicons](https://ionic.io/ionicons). Incluye transiciones nativas entre pantallas, microinteracciones al presionar, animaciones de entrada escalonadas, esqueletos de carga y un encabezado que se oculta al desplazarse hacia abajo.

---

## Capturas de pantalla

### Acceso y registro por tipo de cuenta

| Inicio de sesión | Tipo de cuenta | Crear cuenta | Datos de la mascota |
| :---: | :---: | :---: | :---: |
| <img src="docs/screenshots/01-login.jpg" width="200"> | <img src="docs/screenshots/02-registro-tipo-de-cuenta.jpg" width="200"> | <img src="docs/screenshots/03-registro-cuenta.jpg" width="200"> | <img src="docs/screenshots/04-registro-mascota.jpg" width="200"> |

| Datos del negocio | Buscar dirección (OpenCage) | Ubicar el negocio en el mapa |
| :---: | :---: | :---: |
| <img src="docs/screenshots/05-registro-negocio-datos.jpg" width="200"> | <img src="docs/screenshots/06-registro-negocio-buscar-direccion.jpg" width="200"> | <img src="docs/screenshots/07-registro-negocio-mapa.jpg" width="200"> |

### Feed de la comunidad

| Inicio | Publicaciones | Encabezado compacto | Momentos |
| :---: | :---: | :---: | :---: |
| <img src="docs/screenshots/08-feed.jpg" width="200"> | <img src="docs/screenshots/09-feed-publicaciones.jpg" width="200"> | <img src="docs/screenshots/10-feed-encabezado-compacto.jpg" width="200"> | <img src="docs/screenshots/11-feed-momentos.jpg" width="200"> |

| Mascota perdida | Promociones | Comentarios | Opciones y reportes |
| :---: | :---: | :---: | :---: |
| <img src="docs/screenshots/12-feed-mascota-perdida.jpg" width="200"> | <img src="docs/screenshots/13-feed-promociones.jpg" width="200"> | <img src="docs/screenshots/14-comentarios.jpg" width="200"> | <img src="docs/screenshots/38-reportar-motivo.jpg" width="200"> |

### Crear publicaciones

| Nueva publicación | Reporte de mascota perdida | Aviso de una veterinaria | Sin conexión: borrador |
| :---: | :---: | :---: | :---: |
| <img src="docs/screenshots/16-crear-publicacion.jpg" width="200"> | <img src="docs/screenshots/17-crear-reporte-perdido.jpg" width="200"> | <img src="docs/screenshots/35-veterinaria-crear-aviso.jpg" width="200"> | <img src="docs/screenshots/32-crear-sin-conexion-borrador.jpg" width="200"> |

### Mapa y servicios

| Mapa | Cerca de ti | Veterinarias | Petshops |
| :---: | :---: | :---: | :---: |
| <img src="docs/screenshots/18-mapa.jpg" width="200"> | <img src="docs/screenshots/19-mapa-cerca-de-ti.jpg" width="200"> | <img src="docs/screenshots/20-servicios-veterinarias.jpg" width="200"> | <img src="docs/screenshots/21-servicios-petshops.jpg" width="200"> |

| Detalle del negocio | Reseñas | Calificar | Directorio verificado |
| :---: | :---: | :---: | :---: |
| <img src="docs/screenshots/22-detalle-veterinaria.jpg" width="200"> | <img src="docs/screenshots/23-detalle-resenas.jpg" width="200"> | <img src="docs/screenshots/24-calificar-negocio.jpg" width="200"> | <img src="docs/screenshots/42-directorio-verificadas.jpg" width="200"> |

### Mensajes y perfil

| Mensajes | Compartir ubicación | Ubicación en el chat | Chat del petshop |
| :---: | :---: | :---: | :---: |
| <img src="docs/screenshots/25-mensajes.jpg" width="200"> | <img src="docs/screenshots/26-chat-compartir-ubicacion.jpg" width="200"> | <img src="docs/screenshots/27-chat-ubicacion.jpg" width="200"> | <img src="docs/screenshots/36-petshop-chat-recibido.jpg" width="200"> |

| Mi mascota | Mi cuenta | Editar perfil | Sin conexión |
| :---: | :---: | :---: | :---: |
| <img src="docs/screenshots/28-mi-mascota.jpg" width="200"> | <img src="docs/screenshots/29-mi-cuenta.jpg" width="200"> | <img src="docs/screenshots/30-editar-perfil.jpg" width="200"> | <img src="docs/screenshots/31-sin-conexion.jpg" width="200"> |

### Negocios y administración

| Mi negocio | Editar negocio | Petshop | Panel de control |
| :---: | :---: | :---: | :---: |
| <img src="docs/screenshots/33-mi-negocio.jpg" width="200"> | <img src="docs/screenshots/34-mi-negocio-editar.jpg" width="200"> | <img src="docs/screenshots/37-petshop-mi-negocio.jpg" width="200"> | <img src="docs/screenshots/39-admin-reportes.jpg" width="200"> |

| Negocios por verificar | Negocios verificados |
| :---: | :---: |
| <img src="docs/screenshots/40-admin-negocios.jpg" width="200"> | <img src="docs/screenshots/41-admin-negocios-verificados.jpg" width="200"> |

---

## Tecnologías

| Área | Tecnología |
| :--- | :--- |
| Interfaz | Ionic React 8, React 19, TypeScript 5.9, SCSS Modules, Ionicons |
| Empaquetado | Vite 8 |
| App nativa | Capacitor 8 (Android) |
| Autenticación | Firebase Authentication (correo y contraseña) |
| Base de datos y tiempo real | Cloud Firestore con `onSnapshot` y reglas de seguridad |
| Imágenes | Cloudinary (subida sin firma y entrega optimizada) |
| Mapas | Leaflet + React Leaflet con mapas de OpenStreetMap |
| Geocodificación | OpenCage Data (dirección a coordenadas y coordenadas a dirección) |
| Almacenamiento local | Dexie.js (IndexedDB) y `dexie-react-hooks` |
| Tipografía | Plus Jakarta Sans (incluida en el APK con `@fontsource`) |

---

## Arquitectura del proyecto

```text
src/
├── components/            Componentes por módulo
│   ├── Chat/              Fila de conversación, burbujas y tarjeta de ubicación
│   ├── Feed/              Tarjeta de publicación, comentarios, plan de hoy, esqueletos
│   ├── Map/               Mapa de la comunidad y selector de dirección
│   ├── Profile/           Ficha de la mascota
│   ├── Shared/            Barra inferior, encabezados, avatar, chips, selector de fotos, aviso sin conexión
│   └── Vets/              Tarjeta de negocio y formulario de negocio
├── context/               AuthContext (sesión, rol, mascota, negocio) y AppContext (feed, chats, red, batería)
├── helpers/               Formato de fechas y distancias, validadores, geografía y errores HTTP
├── hooks/                 useCamera, useGeolocation, useNetwork, useHaptics, useLocalNotifications,
│                          useDevice, useDexie, useRealtime, useAddressSearch, useScrollHeader, useStartChat
├── lib/                   firebase.ts, http.ts (fetch con AbortController) y db.ts (Dexie)
├── pages/                 Una carpeta por vista: Auth, Feed, CreatePost, Map, Vets, MyBusiness, Chat, Profile, Admin
├── routes/                AppRoutes, UserRoutes y AdminRoutes (protección por sesión y rol)
├── services/              Firestore (auth, posts, chats, businesses, pets, admin), cloudinary y opencagedata
├── theme/                 Tokens de diseño, variables de Ionic y estilos globales
└── types/                 Modelos de dominio en TypeScript
```

- **Hooks:** encapsulan cada sensor y cada suscripción. Todos limpian sus listeners al desmontarse.
- **Servicios:** concentran el acceso a Firestore y a las APIs. Las vistas no llaman a Firebase directamente.
- **Rutas protegidas:** sin sesión se redirige al inicio de sesión; `/admin` solo es accesible con rol `admin`, y las reglas de Firestore aplican la misma restricción en el servidor.

---

## Modelo de datos y seguridad

### Colecciones de Firestore

| Colección | Contenido |
| :--- | :--- |
| `users/{uid}` | Perfil y rol (`owner`, `vet`, `petshop`, `admin`) |
| `pets/{id}` | Mascotas de cada dueño |
| `businesses/{uid}` | Perfil de veterinarias y petshops: dirección, ubicación, servicios, verificación y promedios de calificación |
| `reviews/{negocio_usuario}` | Reseñas; una por usuario y negocio |
| `posts/{id}` | Publicaciones del feed |
| `posts/{id}/likes/{uid}` | Me gusta |
| `posts/{id}/comments/{id}` | Comentarios |
| `chats/{uidA_uidB}` | Conversaciones entre dos cuentas, con no leídos por miembro |
| `chats/{id}/messages/{id}` | Mensajes de texto o de ubicación |
| `reports/{id}` | Reportes de contenido para moderación |

### Reglas de seguridad

Las reglas de [`firestore.rules`](firestore.rules) cumplen el papel de las políticas RLS:

- Cada cuenta edita solo su perfil, su mascota, su negocio y sus publicaciones. Nadie puede asignarse el rol de administrador.
- Cada rol publica solo sus categorías: los dueños paseos, perdidos y tips; las veterinarias tips y avisos; los petshops promociones. Todos pueden publicar momentos.
- Los contadores de me gusta y comentarios solo cambian de a uno y junto con su documento correspondiente.
- Cada dueño puede dejar una sola reseña por negocio, y los promedios se actualizan en la misma operación.
- Los chats y sus mensajes solo son visibles para sus dos miembros.
- Solo el administrador lee los reportes, verifica negocios y elimina contenido ajeno.

---

## Sensores nativos

| Plugin | Uso en la app |
| :--- | :--- |
| `@capacitor/camera` | Foto desde la cámara o la galería al publicar, en la foto de la mascota y en el logo del negocio |
| `@capacitor/geolocation` | Ubicación para publicaciones, mapa en vivo, distancias, dirección de negocios y ubicación compartida en el chat |
| `@capacitor/local-notifications` | Avisos de mensajes nuevos, mascotas perdidas, paseos confirmados y recordatorio del paseo |
| `@capacitor/network` | Aviso sin conexión y desactivación de acciones que requieren el servidor |
| `@capacitor/haptics` | Respuesta táctil al dar me gusta, abrir el botón "+", publicar y calificar |
| `@capacitor/device` | Nivel de batería: con menos del 20 % el mapa pausa el seguimiento continuo del GPS |
| `SystemBars` (Capacitor 8) | Barra de estado con iconos oscuros sobre el fondo claro |

---

## APIs y servicios consumidos

| Servicio | Para qué se usa |
| :--- | :--- |
| **Firebase Authentication** | Registro, inicio y cierre de sesión persistente |
| **Cloud Firestore** | Datos de la app, reglas de seguridad y sincronización en tiempo real |
| **Cloudinary** | Almacenamiento y optimización de las fotos |
| **OpenCage Data** | Geocodificación directa e inversa, limitada a Cali |
| **OpenStreetMap** | Mapas base de Leaflet |
| **Google Maps** (enlace) | Ruta "Cómo llegar" hasta un negocio o una ubicación compartida |

Las peticiones HTTP pasan por un cliente propio ([`src/lib/http.ts`](src/lib/http.ts)) que cancela con `AbortController` al desmontar una vista o al cambiar una búsqueda, aplica un tiempo máximo de espera y traduce los errores a mensajes entendibles.

---

## Instalación y ejecución

### Requisitos

- Node.js 20 o superior
- Un proyecto de Firebase con **Authentication** (correo y contraseña) y **Firestore** activos
- Una cuenta de Cloudinary con un *upload preset* sin firma
- Una API Key de OpenCage Data

### Pasos

```bash
git clone https://github.com/jbrayner123/Desarrollo-Movil.git
cd Desarrollo-Movil
git checkout proyecto-final
npm install
cp .env.example .env    # completar las variables
npm run dev             # http://localhost:5178
```

Después hay que publicar las reglas: copiar el contenido de `firestore.rules` en **Firebase, Firestore, Reglas** y pulsar **Publicar**.

### Variables de entorno (`.env.example`)

```env
# Firebase: Configuración del proyecto > Tus apps > App web
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Cloudinary: Dashboard (Cloud name) y Settings > Upload > Upload presets (unsigned)
VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_UPLOAD_PRESET=manada

# OpenCage Data: https://opencagedata.com/dashboard
VITE_OPENCAGE_API_KEY=
```

### Asignar un administrador

1. Registrar la cuenta en la app.
2. En **Firestore, Datos, `users`**, abrir el documento de esa cuenta.
3. Cambiar el campo `role` a `admin`.

---

## Compilar el APK de Android

Requiere Android Studio (o el SDK de Android) y JDK 21.

```bash
npm run build
npx cap sync android
cd android
./gradlew assembleDebug
```

El APK queda en `android/app/build/outputs/apk/debug/app-debug.apk`.

---

## Cuentas de demostración

La base de datos incluye cuentas de prueba para revisar la app. Todas usan la contraseña `Manada2026`.

| Tipo | Correo | Contenido |
| :--- | :--- | :--- |
| Dueña | `valentina.demo@manada.app` | Valentina y su gato Mango, momentos, reseñas y chat con un petshop |
| Dueño | `sebastian.demo@manada.app` | Sebastián y su gato Oreo |
| Dueño | `camilo.demo@manada.app` | Camilo y Coco, reporte de mascota perdida |
| Veterinaria | `animalcenter.demo@manada.app` | Animal Center 24 h, verificada y con reseñas |
| Veterinaria | `patitas.demo@manada.app` | Clínica Veterinaria Patitas |
| Petshop | `mascotasyco.demo@manada.app` | Mascotas & Co, con promoción y chat |

Las veterinarias y los petshops de demostración son ficticios, salvo Nuno Petshop, que aparece con su dirección real.

---

Un proyecto de **José Brayner Minotta Ruiz** y **Gabriela Chávez** · Desarrollo de Aplicaciones Web y Móviles · 2026
