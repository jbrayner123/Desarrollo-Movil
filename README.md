# Reto 5: Gestor de Tareas Móvil Avanzado con Autenticación Firebase

Aplicación móvil desarrollada con **Ionic Framework** (`@ionic/react`), **TypeScript**, **Capacitor** y **Firebase Authentication**, correspondiente al **Challenge 05** del curso de *Desarrollo de Software para Plataformas Móviles* (Prof. Jonathan López).

Evolución directa del Reto 3 que preserva su diseño visual limpio y minimalista, integrando arquitectura desacoplada por capas, dos contextos de estado con Context API, custom hooks especializados y rutas protegidas con React Router e Ionic.

---

## 📌 Arquitectura del Proyecto (`src/`)

```text
src/
├── firebase/
│   └── config.ts             <-- Inicialización modular de Firebase con getAuth()
├── hooks/
│   ├── useAuth.ts            <-- Custom hook para autenticación (login, register, logout, estado)
│   └── useTasks.ts           <-- Custom hook para CRUD y persistencia de tareas
├── context/
│   ├── AuthContext.tsx       <-- Contexto y Provider exclusivo de Autenticación
│   └── TasksContext.tsx      <-- Contexto y Provider exclusivo de Tareas
├── pages/
│   ├── Login.tsx             <-- Pantalla de inicio de sesión (/login)
│   ├── Register.tsx          <-- Pantalla de registro de usuario (/register)
│   ├── TasksList.tsx         <-- Dashboard y lista de tareas con FAB y logout (/tasks)
│   ├── TaskForm.tsx          <-- Formulario de creación y edición (/tasks/new y /tasks/edit/:id)
│   └── TaskDetail.tsx        <-- Vista detallada de una tarea (/tasks/:id)
├── types/
│   └── task.ts               <-- Interface de Task (id, title, description, completed, date, etc.)
├── App.tsx                   <-- Rutas configuradas, rutas protegidas y Providers
├── main.tsx                  <-- Punto de entrada e inicialización de Ionic
├── App.css                   <-- Estilos visuales adaptados del Reto 3
└── index.css                 <-- Tokens de color y temas base
```

---

## 🚀 Funcionalidades y Cumplimiento de Requerimientos

1. **Autenticación con Firebase (`firebase/auth`)**:
   - Registro de usuarios con `createUserWithEmailAndPassword`.
   - Inicio de sesión con `signInWithEmailAndPassword`.
   - Cierre de sesión con `signOut`.
   - Detección de sesión activa con `onAuthStateChanged` y respaldo en `localStorage`.

2. **Gestión de Estado Desacoplada (2 Contextos)**:
   - `AuthContext`: Controla sesión, usuario autenticado, estados de carga y errores de acceso.
   - `TasksContext`: Expone tareas y operaciones CRUD (`addTask`, `updateTask`, `deleteTask`, `toggleTaskStatus`, `getTaskById`) eliminando prop drilling.

3. **Lógica Aislada en Custom Hooks**:
   - `useAuth`: Encapsula toda la comunicación con Firebase y traducción de errores.
   - `useTasks`: Encapsula la lógica de negocio y persistencia en `localStorage`.

4. **Páginas y Enrutamiento Protegido**:
   - `/login` y `/register`: Rutas públicas (redirigen a `/tasks` si ya hay sesión).
   - `/tasks`, `/tasks/new`, `/tasks/edit/:id`, `/tasks/:id`: Rutas protegidas (redirigen automáticamente a `/login` si no hay sesión activa).

5. **Diseño Visual e Interfaz de Usuario**:
   - Mantiene la estética visual del Reto 3 (`ion-card` estilizados, badges de estadísticas, botones primarios).
   - Botón Flotante (`IonFab` + `IonFabButton`) para agregar nuevas tareas rápidamente.
   - Diálogos nativos de confirmación (`IonAlert`) para eliminar tareas y confirmar cierre de sesión.

---

## ⚙️ Configuración de Firebase Console

1. Ingresa a [Firebase Console](https://console.firebase.google.com/) con tu cuenta de Google.
2. Crea un proyecto nuevo o selecciona uno existente.
3. En el menú lateral, dirígete a **Build (Compilación)** -> **Authentication**.
4. Haz clic en **Comenzar** y en la pestaña **Sign-in method**, activa el proveedor **Correo electrónico/contraseña**.
5. Ve a **Configuración del Proyecto** (ícono de engranaje) -> pestaña **General** -> sección **Tus apps** y haz clic en el ícono Web `</>`.
6. Copia las credenciales de `firebaseConfig` y reemplázalas en el archivo:
   ```typescript
   // src/firebase/config.ts
   const firebaseConfig = {
     apiKey: "TU_API_KEY",
     authDomain: "TU_PROJECT.firebaseapp.com",
     projectId: "TU_PROJECT",
     storageBucket: "TU_PROJECT.appspot.com",
     messagingSenderId: "TU_SENDER_ID",
     appId: "TU_APP_ID"
   };
   ```

> **Nota:** La aplicación incluye un modo evaluación/fallback activo si las credenciales de Firebase aún están en placeholder, permitiendo realizar login y registro inmediato para pruebas académicas.

---

## 💻 Instalación y Ejecución

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar el servidor local de desarrollo
npm run dev

# 3. Compilar para producción
npm run build

# 4. Sincronizar con Capacitor Android (opcional para pruebas nativas)
npx cap sync android
```

---

## 👤 Información de Entrega

- **Estudiante**: José Brayner Minotta
- **Asignatura**: Desarrollo de Software para Plataformas Móviles
- **Docente**: Jonathan López
- **Rama Oficial**: `challenger-05`
