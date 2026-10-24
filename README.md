# Reto 6: Persistencia Multi-Motor (Firestore, Realtime DB, Dexie IndexedDB) y Sensores Nativos de Red

Aplicacion movil desarrollada con **Ionic Framework** (`@ionic/react`), **TypeScript**, **Capacitor** y **Firebase**, correspondiente al **Challenge 06** del curso de *Desarrollo de Software para Plataformas Moviles* (Prof. Jonathan Lopez).

Este proyecto integra tres capas de almacenamiento y persistencia diferenciadas (Cloud Firestore, Firebase Realtime Database y Dexie.js IndexedDB local), junto con el sensor nativo de conectividad `@capacitor/network` para la validacion y bloqueo condicional de acciones de red.

---

## 1. Arquitectura del Proyecto (`src/`)

```text
src/
├── firebase/
│   └── config.ts             <-- Inicializacion modular con Auth, Firestore (db) y Realtime Database (rtdb)
├── db/
│   └── db.ts                 <-- Instancia Dexie ('MiAppDB') con versionado de esquemas para la tabla 'frutas'
├── hooks/
│   ├── useCollection.ts      <-- Hook Cloud Firestore con getAll(filters), add(), update(), remove()
│   ├── useRealTimeCollection.ts <-- Hook Realtime Database con onValue(), getAll(), add(), update(), deleteDoc()
│   ├── useDexie.ts           <-- Hook Dexie IndexedDB con useLiveQuery(), getAll(), add(), update(), deleteItem()
│   ├── useNetwork.ts         <-- Hook sensor Capacitor Network (isOnline, connectionType, simulación)
│   ├── useAuth.ts            <-- Hook de autenticacion con Firebase Auth
│   └── useTasks.ts           <-- Hook de tareas adaptado sobre useRealTimeCollection
├── context/
│   ├── AuthContext.tsx       <-- Provider de Autenticacion
│   └── TasksContext.tsx      <-- Provider de Tareas sobre Realtime Database
├── components/
│   ├── NetworkStatusBar.tsx  <-- Barra de estado de red con alerta tecnica y alternador de simulacion
│   └── AppBottomNav.tsx      <-- Barra de pestañas inferior (Tabs nativos) para los 4 modulos
├── pages/
│   ├── Login.tsx             <-- Pantalla de autenticacion (/login)
│   ├── Register.tsx          <-- Pantalla de registro (/register)
│   ├── TasksList.tsx         <-- Tareas en tiempo real (/tasks) - Bloqueado offline
│   ├── TaskForm.tsx          <-- Formulario de creacion y edicion (/tasks/new y /tasks/edit/:id)
│   ├── TaskDetail.tsx        <-- Detalle de tarea (/tasks/:id)
│   ├── ContactsList.tsx      <-- Directorio de Contactos con Firestore (/contacts) - Bloqueado offline
│   ├── FruitsList.tsx        <-- Inventario de Frutas con Dexie (/fruits) - 100% Offline-First
│   └── NetworkDiagnostics.tsx <-- Panel de diagnostico del sensor de red y matriz de persistencia (/network)
├── types/
│   ├── task.ts               <-- Modelo de Tarea
│   └── contact.ts            <-- Modelo de Contacto
├── App.tsx                   <-- Enrutador protegido con IonReactRouter y rutas de los 4 modulos
├── main.tsx                  <-- Punto de entrada e inicializacion de Ionic
├── App.css                   <-- Estilos tecnicos, sobrios y de alto contraste
└── index.css                 <-- Tokens de diseno base
```

---

## 2. Los 4 Custom Hooks Obligatorios

### A. `useCollection(table)` (Firebase Cloud Firestore -> Para Contactos)
- **Ubicación:** `src/hooks/useCollection.ts`
- **Estados:** `results`, `isPending`, `error`.
- **Métodos:**
  - `getAll(filters = [])`: Ejecuta consulta con `query(collection(db, table))` aplicando filtros dinamicos con `where(field, op, value)` y `getDocs`.
  - `add(data)`: Inserta con `addDoc` agregando `createdAt: serverTimestamp()`.
  - `update(id, data)`: Modifica con `updateDoc(doc(db, table, id), { ...data, updatedAt: serverTimestamp() })`.
  - `remove(id)`: Elimina con `deleteDoc(doc(db, table, id))`.

### B. `useRealTimeCollection(table)` (Firebase Realtime Database -> Para Tareas)
- **Ubicación:** `src/hooks/useRealTimeCollection.ts`
- **Estados:** `results`, `isPending`, `error`.
- **Métodos y Reactividad:**
  - `useEffect`: Se suscribe en tiempo real con `onValue(ref(rtdb, table), ...)`. Transforma el snapshot mediante `Object.entries(snapshot.val()).map(([id, value]) => ({ id, ...value }))` y ejecuta el cleanup desuscribiendose con `unsubscribe()`.
  - `getAll()`: Lectura puntual usando `get(ref(rtdb, table))`.
  - `add(data)`: Inserta con `push(ref(rtdb, table), { ...data, createdAt: new Date().toISOString() })`.
  - `update(id, data)`: Actualiza con `set(ref(rtdb, `${table}/${id}`), { ...data, updatedAt: new Date().toISOString() })`.
  - `deleteDoc(id)`: Remueve con `remove(ref(rtdb, `${table}/${id}`))`.

### C. `useDexie(table, filterFn = null)` (Dexie IndexedDB -> Para Frutas)
- **Ubicación:** `src/hooks/useDexie.ts` y `src/db/db.ts`
- **Configuración:** Esquema en `MiAppDB` con la tabla `frutas: "++id, nombre, proveedor, fechaCosecha, createdAt"`.
- **Reactividad:** `liveResults` implementado con `useLiveQuery` de `dexie-react-hooks` para escuchar mutaciones reactivas en IndexedDB.
- **Métodos:**
  - `getAll()`: Lectura manual a traves de `db[table].toArray()`.
  - `add(data)`: Inserta en IndexedDB con `createdAt`.
  - `update(id, data)`: Modifica por clave primaria.
  - `deleteItem(id)`: Elimina por clave primaria con `delete(id)`.

### D. `useNetwork()` (`@capacitor/network` -> Sensor de Conectividad)
- **Ubicación:** `src/hooks/useNetwork.ts`
- **Estados:** `isOnline` (boolean) y `connectionType` (`wifi | cellular | none | unknown`).
- **Ciclo de Vida:** Inicializa consultando `Network.getStatus()` y se suscribe a eventos con `Network.addListener("networkStatusChange", ...)`, eliminando el listener en el cleanup de `useEffect`.
- **Modo Simulador:** Incluye funcion para alternar modo offline de prueba sin necesidad de desconectar la interfaz fisica.

---

## 3. Matriz de Comportamiento Offline y Bloqueo de Acciones

| Módulo | Motor de Persistencia | Hook | Comportamiento cuando `isOnline === false` |
| :--- | :--- | :--- | :--- |
| **Contactos** | Cloud Firestore | `useCollection("contacts")` | **BLOQUEADO (`disabled={!isOnline}`):** Los botones de registrar, editar y eliminar, asi como los inputs del formulario, se deshabilitan. Se despliega alerta de sincronizacion pausada. |
| **Tareas** | Realtime Database | `useRealTimeCollection("tasks")` | **BLOQUEADO (`disabled={!isOnline}`):** Boton flotante (+), checkboxes de cambio de estado, edicion y eliminacion se deshabilitan. Lectura permitida. |
| **Frutas** | Dexie IndexedDB | `useDexie("frutas")` | **100% OPERATIVO (Offline-First):** Ninguna accion de creacion, modificacion o eliminacion se bloquea. Persiste localmente en el navegador o dispositivo. |
| **Diagnóstico** | Capacitor Network | `useNetwork()` | Muestra en tiempo real el tipo de red activa (Wi-Fi, Celular, Ninguna) y permite simular desconexion. |

---

## 4. Guía de Ejecución y Validación

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo Vite
npm run dev

# 3. Compilar el proyecto para validar tipos y empaquetado
npm run build

# 4. Verificación estricta de TypeScript
npx tsc --noEmit
```

---

## 5. Pruebas Rápidas de los Requerimientos

1. **Navegación:** Inicia sesion (puedes usar `demo@test.com` con clave `123456`). Usa las pestañas inferiores para alternar entre **Tareas**, **Contactos**, **Frutas** y **Red**.
2. **Probar el Bloqueo de Red:**
   - Ve a la pestaña **Red** o usa el boton **Simular Offline** en la barra superior.
   - Entra a **Tareas**: Observa que el boton (+), los checkboxes de tareas y las opciones de editar y eliminar estan bloqueados (`disabled`).
   - Entra a **Contactos**: Observa que el boton (+) y las opciones de edicion y borrado estan bloqueados (`disabled`).
   - Entra a **Frutas**: Observa que puedes crear, editar y eliminar frutas sin ninguna restriccion gracias a Dexie IndexedDB.
   - Haz clic en **Restablecer Conexion**: Tareas y Contactos vuelven a habilitarse inmediatamente.
