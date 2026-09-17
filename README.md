# Desarrollo de Aplicaciones Web y Móviles

Repositorio principal de la asignatura **Desarrollo Móvil**, que recopila el **Primer Examen Parcial** y los **4 Retos Prácticos (Challengers)** desarrollados con **React**, **Vite** e **Ionic React**.

---

## 📌 Organización del Repositorio por Ramas

Cada proyecto se encuentra alojado en una **rama independiente** con sus dependencias y código fuente directamente en la raíz para facilitar su compilación y ejecución directa:

| Rama | Proyecto | Tecnología | Descripción |
| :--- | :--- | :--- | :--- |
| [`parcial1-jose-brayner-minotta`](https://github.com/jbrayner123/Desarrollo-Movil/tree/parcial1-jose-brayner-minotta) | **Parcial 1: Sistema Hospitalario** | React + Ionic React | Contiene los 2 ejercicios del examen: PWA React (Gestión de Pacientes) e Ionic App (Visitas Médicas Domiciliarias) junto con sus evidencias fotográficas. |
| [`challenger-01`](https://github.com/jbrayner123/Desarrollo-Movil/tree/challenger-01) | **Reto 1: Gestor de Contactos** | React + Vite | Componentes funcionales modulares (`Header`, `ContactForm`, `ContactList`, `ContactItem`, `Loader`) y manejo de estado CRUD con `useState` y `useEffect`. |
| [`challenger-02`](https://github.com/jbrayner123/Desarrollo-Movil/tree/challenger-02) | **Reto 2: Gestor PWA** | React + Vite PWA | Evolución PWA con Service Worker, estrategia híbrida de caché (Precaché + Runtime Caching), manifest y despliegue en producción en Netlify. |
| [`challenger-03`](https://github.com/jbrayner123/Desarrollo-Movil/tree/challenger-03) | **Reto 3: Task Manager Móvil** | Ionic React + Capacitor | Gestor de tareas con componentes nativos de Ionic (`IonPage`, `IonCard`, `IonCheckbox`), tachado dinámico y archivo compilado `TaskManager.apk` listo para Android. |
| [`challenger-04`](https://github.com/jbrayner123/Desarrollo-Movil/tree/challenger-04) | **Reto 4: Storage y Rutas Protegidas** | Ionic React + TypeScript | Flujo de autenticación con credenciales demo, almacenamiento de token en `localStorage`, protección de rutas con recarga y cierre de sesión (Logout). |

---

## 💻 Instrucciones para Clonar y Cambiar de Rama

Para clonar el repositorio completo y navegar entre los diferentes proyectos:

```bash
# 1. Clonar el repositorio
git clone https://github.com/jbrayner123/Desarrollo-Movil.git
cd Desarrollo-Movil

# 2. Cambiar a la rama del proyecto que desees revisar:
git checkout parcial1-jose-brayner-minotta   # Examen Parcial 1
git checkout challenger-01                  # Reto 1: React Repaso
git checkout challenger-02                  # Reto 2: PWA Netlify
git checkout challenger-03                  # Reto 3: Ionic Task Manager + APK
git checkout challenger-04                  # Reto 4: Ionic Storage & Auth

# 3. En cada rama, instalar dependencias y ejecutar:
npm install
npm run dev
```

---

## 👤 Información del Estudiante

- **Estudiante**: José Brayner Minotta
- **Asignatura**: Desarrollo de Aplicaciones Web y Móviles
- **Repositorio Oficial**: [https://github.com/jbrayner123/Desarrollo-Movil](https://github.com/jbrayner123/Desarrollo-Movil)
