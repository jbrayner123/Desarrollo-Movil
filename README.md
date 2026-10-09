# Reto 5: Gestor de Tareas Movil Avanzado con Autenticacion Firebase

Aplicacion movil desarrollada con **Ionic Framework** (`@ionic/react`), **TypeScript**, **Capacitor** y **Firebase Authentication**, correspondiente al **Challenge 05** del curso de *Desarrollo de Software para Plataformas Moviles* (Prof. Jonathan Lopez).

Evolucion directa del Reto 3 que preserva su diseno visual limpio y minimalista, integrando arquitectura desacoplada por capas, dos contextos de estado con Context API, custom hooks especializados, aislamiento de tareas por usuario y rutas protegidas con React Router e Ionic.

---

## 1. Arquitectura del Proyecto (`src/`)

```text
src/
├── firebase/
│   └── config.ts             <-- Inicializacion modular de Firebase con getAuth()
├── hooks/
│   ├── useAuth.ts            <-- Custom hook para autenticacion (login, register, logout, estado)
│   └── useTasks.ts           <-- Custom hook para CRUD y persistencia de tareas por usuario
├── context/
│   ├── AuthContext.tsx       <-- Contexto y Provider exclusivo de Autenticacion
│   └── TasksContext.tsx      <-- Contexto y Provider exclusivo de Tareas
├── pages/
│   ├── Login.tsx             <-- Pantalla de inicio de sesion (/login)
│   ├── Register.tsx          <-- Pantalla de registro de usuario (/register)
│   ├── TasksList.tsx         <-- Dashboard y lista de tareas con FAB y logout (/tasks)
│   ├── TaskForm.tsx          <-- Formulario de creacion y edicion (/tasks/new y /tasks/edit/:id)
│   └── TaskDetail.tsx        <-- Vista detallada de una tarea (/tasks/:id)
├── types/
│   └── task.ts               <-- Interface de Task (id, userId, title, description, completed, date, etc.)
├── App.tsx                   <-- Rutas configuradas, rutas protegidas y Providers
├── main.tsx                  <-- Punto de entrada e inicializacion de Ionic
├── App.css                   <-- Estilos visuales adaptados del Reto 3
└── index.css                 <-- Tokens de color y temas base
```

---

## 2. Funcionalidades y Cumplimiento de Requerimientos

1. **Autenticacion con Firebase (`firebase/auth`)**:
   - Registro de usuarios con `createUserWithEmailAndPassword`.
   - Inicio de sesion con `signInWithEmailAndPassword`.
   - Cierre de sesion con `signOut`.
   - Deteccion de sesion activa con `onAuthStateChanged` y respaldo en `localStorage`.

2. **Gestion de Estado Desacoplada (2 Contextos)**:
   - `AuthContext`: Controla sesion, usuario autenticado, estados de carga y errores de acceso.
   - `TasksContext`: Expone tareas y operaciones CRUD (`addTask`, `updateTask`, `deleteTask`, `toggleTaskStatus`, `getTaskById`) eliminando prop drilling.

3. **Logica Aislada en Custom Hooks y Aislamiento por Usuario**:
   - `useAuth`: Encapsula toda la comunicacion con Firebase y traduccion de errores.
   - `useTasks`: Encapsula la logica de negocio y persistencia en `localStorage`, aislando las tareas de cada usuario bajo su propio `userId`. Cada cuenta maneja su lista independiente sin mezclarse.

4. **Paginas y Enrutamiento Protegido**:
   - `/login` y `/register`: Rutas publicas (redirigen a `/tasks` si ya hay sesion activa).
   - `/tasks`, `/tasks/new`, `/tasks/edit/:id`, `/tasks/:id`: Rutas protegidas (redirigen automaticamente a `/login` si no hay sesion activa).

5. **Diseno Visual e Interfaz de Usuario**:
   - Mantiene la estetica visual del Reto 3 (`ion-card` estilizados, badges de estadisticas, botones primarios).
   - Boton Flotante (`IonFab` + `IonFabButton`) para agregar nuevas tareas rapidamente.
   - Dialogos nativos de confirmacion (`IonAlert`) para eliminar tareas y confirmar cierre de sesion.

---

## 3. Configuracion de Firebase Console

1. Ingresa a [Firebase Console](https://console.firebase.google.com/) con tu cuenta de Google.
2. Crea un proyecto nuevo o selecciona uno existente.
3. En el menu lateral, dirigete a **Build (Compilacion)** -> **Authentication**.
4. Haz clic en **Comenzar** y en la pestana **Sign-in method**, activa el proveedor **Correo electronico/contrasena**.
5. Ve a **Configuracion del Proyecto** -> pestana **General** -> seccion **Tus apps** y haz clic en el icono Web `</>`.
6. Copia las credenciales de `firebaseConfig` y reemplazalas en el archivo:
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

---

## 4. Instalacion y Ejecucion

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar el servidor local de desarrollo
npm run dev

# 3. Compilar para produccion
npm run build

# 4. Sincronizar con Capacitor Android (opcional para pruebas nativas)
npx cap sync android
```

---

## 5. Informacion de Entrega

- **Estudiante**: Jose Brayner Minotta
- **Asignatura**: Desarrollo de Software para Plataformas Moviles
- **Docente**: Jonathan Lopez
- **Rama Oficial**: `challenger-05`
