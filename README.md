# Challenge 08: Supabase Auth, PostgreSQL RLS, Realtime y Storage

Aplicacion movil desarrollada con **Ionic Framework** (`@ionic/react`), **TypeScript**, **Capacitor** y **Supabase** (`@supabase/supabase-js`), correspondiente al **Challenge 08** del curso de *Desarrollo de Software para Plataformas Moviles*.

La aplicacion implementa autenticacion de usuarios, persistencia en base de datos PostgreSQL protegida mediante politicas de seguridad a nivel de fila (Row Level Security - RLS), sincronizacion en vivo reactiva con Supabase Realtime (`postgres_changes`) y captura de imagenes con la camara nativa (`@capacitor/camera`) almacenadas en el bucket publico `avatars` de Supabase Storage.

---

## 1. Arquitectura de Directorios (`src/`)

```text
├── android/                         <-- Proyecto nativo Android generado con Capacitor
│   └── app/src/main/AndroidManifest.xml <-- Permisos de Camara, Internet y Almacenamiento
├── src/
│   ├── context/
│   │   └── AuthContext.tsx          <-- Estado global de sesion, login, registro y avatar
│   ├── lib/
│   │   └── supabase.ts              <-- Cliente singleton de Supabase (@supabase/supabase-js)
│   ├── pages/
│   │   ├── AuthPage.tsx             <-- Pantalla de Login y Registro con validacion
│   │   └── TasksPage.tsx            <-- CRUD de tareas, lista en vivo Realtime y captura de avatar
│   ├── theme/
│   │   └── variables.css            <-- Estetica tecnica sobria y de alto contraste
│   ├── types/
│   │   └── index.ts                 <-- Interfaces TypeScript para Tarea y Usuario
│   ├── App.tsx                      <-- Enrutador Ionic con proteccion de rutas
│   └── main.tsx                     <-- Punto de entrada de la aplicacion
├── supabase_setup.sql               <-- Script SQL listo para ejecutar en Supabase SQL Editor
├── .env.example                     <-- Plantilla de variables de entorno (URL y Anon Key)
├── capacitor.config.ts              <-- Configuracion de Capacitor (appId: com.desarrollomovil.supabasetasks)
├── package.json                     <-- Dependencias del proyecto
├── tsconfig.json                    <-- Configuracion de compilador TypeScript
└── vite.config.ts                   <-- Bundler Vite
```

---

## 2. Configuracion de Base de Datos y Storage en Supabase (`supabase_setup.sql`)

El archivo [supabase_setup.sql](file:///c:/Users/ADMIN/Documents/fundamentos%20plataformas%20moviles/supabase_setup.sql) contiene los comandos necesarios para desplegar la estructura en el **SQL Editor** de Supabase:

1. **Tabla `public.tareas`:**
   - Campos: `id` (bigint identity), `titulo` (text), `completada` (boolean default false), `user_id` (uuid references auth.users default auth.uid()), `created_at` (timestamptz default now()).

2. **Row Level Security (RLS) en `tareas`:**
   - `ver mis tareas`: `for select to authenticated using ((select auth.uid()) = user_id)`.
   - `crear mis tareas`: `for insert to authenticated with check ((select auth.uid()) = user_id)`.
   - `editar mis tareas`: `for update to authenticated using ((select auth.uid()) = user_id)`.
   - `borrar mis tareas`: `for delete to authenticated using ((select auth.uid()) = user_id)`.

3. **Supabase Realtime:**
   - Adicion de la tabla `public.tareas` a la publicacion `supabase_realtime` para transmision reactiva de eventos `INSERT`, `UPDATE` y `DELETE`.

4. **Bucket de Storage `avatars`:**
   - Creacion de bucket publico `avatars`.
   - Politicas RLS para que cada usuario autenticado gestione unicamente su carpeta identificada con su UID (`(storage.foldername(name))[1] = (select auth.uid())::text`).
   - Politica de lectura publica para renderizado de avatares en la aplicacion.

---

## 3. Funcionalidades Implementadas

### A. Autenticacion Completa (Supabase Auth)
- **Registro:** `supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin, data: { nombre } } })`.
- **Inicio de Sesion:** `supabase.auth.signInWithPassword({ email, password })`.
- **Sesion Persistente y Reactiva:** `supabase.auth.getSession()` y escucha de eventos mediante `supabase.auth.onAuthStateChange`.
- **Cierre de Sesion:** `supabase.auth.signOut()` con limpieza de cache local.

### B. CRUD de Tareas con Proteccion RLS
- **Lectura:** Consulta ordenada por fecha descendente.
- **Insercion:** Creacion de tareas asignadas implicitamente a `auth.uid()`.
- **Modificacion:** Actualizacion del estado `completada` y edicion rapida de titulo.
- **Eliminacion:** Borrado de registros por identificador unico.

### C. Sincronizacion en Tiempo Real (Supabase Realtime)
- Suscripcion activa al canal `cambios-tareas` escuchando el esquema `public` de la tabla `tareas`.
- Manejo de mutaciones en vivo sin recarga de pantalla mediante actualizacion atomica del estado React.
- Indicador visual de estado de conexion al canal Realtime.

### D. Captura de Avatar con Camara Nativa y Subida a Storage
- Captura mediante plugin `@capacitor/camera` con resolucion optimizada y selector entre Camara y Galeria (mas fallback para entornos web).
- Conversion de ruta web a `Blob` y subida a la ruta `${user.id}/${Date.now()}-avatar.jpg` dentro del bucket `avatars`.
- Obtencion de URL publica mediante `getPublicUrl` y recuperacion persistente del avatar mas reciente al iniciar sesion.

---

## 4. Instrucciones de Compilacion y Ejecucion

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno (.env)
# Asigna tus credenciales reales obtenidas del panel de Supabase
# VITE_SUPABASE_URL=https://xxxx.supabase.co
# VITE_SUPABASE_KEY=sb_publishable_xxxx

# 3. Servidor web de desarrollo
npm run dev

# 4. Compilar bundle web
npm run build

# 5. Sincronizar y compilar plataforma Android
npx cap add android   # (Solo primera vez)
npx cap sync android
cd android
./gradlew assembleDebug

# El binario compilado queda generado en:
# android/app/build/outputs/apk/debug/app-debug.apk
# challenger-08-debug.apk
```
