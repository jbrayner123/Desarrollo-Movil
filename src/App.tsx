// src/App.tsx
import React from 'react';
import {
  IonApp,
  IonRouterOutlet,
  IonLoading
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Navigate } from 'react-router-dom';

/* Proveedores de Contexto (Context API) */
import { AuthProvider, useAuthContext } from './context/AuthContext';
import { TasksProvider } from './context/TasksContext';

/* Páginas de la Aplicación */
import Login from './pages/Login';
import Register from './pages/Register';
import TasksList from './pages/TasksList';
import TaskForm from './pages/TaskForm';
import TaskDetail from './pages/TaskDetail';

/* Estilos de la aplicación */
import './App.css';

/**
 * Componente que protege una ruta:
 * Si el usuario no está autenticado, lo redirige a /login.
 */
interface RouteWrapperProps {
  children: React.ReactNode;
}

const ProtectedRouteWrapper: React.FC<RouteWrapperProps> = ({ children }) => {
  const { user, loading } = useAuthContext();

  if (loading) {
    return <IonLoading isOpen={true} message="Verificando sesión..." spinner="crescent" />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

/**
 * Componente para rutas públicas (login/registro):
 * Si ya tiene sesión activa, lo envía directo al listado /tasks.
 */
const PublicRouteWrapper: React.FC<RouteWrapperProps> = ({ children }) => {
  const { user, loading } = useAuthContext();

  if (loading) {
    return <IonLoading isOpen={true} message="Cargando..." spinner="crescent" />;
  }

  if (user) {
    return <Navigate to="/tasks" replace />;
  }

  return <>{children}</>;
};

/**
 * Enrutador principal de la aplicación con IonReactRouter y IonRouterOutlet
 */
const AppRoutes: React.FC = () => {
  return (
    <IonReactRouter>
      <IonRouterOutlet>
        {/* Rutas Públicas (Autenticación) */}
        <Route
          path="/login"
          element={
            <PublicRouteWrapper>
              <Login />
            </PublicRouteWrapper>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRouteWrapper>
              <Register />
            </PublicRouteWrapper>
          }
        />

        {/* Rutas Protegidas (Dashboard y CRUD de Tareas) */}
        <Route
          path="/tasks"
          element={
            <ProtectedRouteWrapper>
              <TasksList />
            </ProtectedRouteWrapper>
          }
        />
        <Route
          path="/tasks/new"
          element={
            <ProtectedRouteWrapper>
              <TaskForm />
            </ProtectedRouteWrapper>
          }
        />
        <Route
          path="/tasks/edit/:id"
          element={
            <ProtectedRouteWrapper>
              <TaskForm />
            </ProtectedRouteWrapper>
          }
        />
        <Route
          path="/tasks/:id"
          element={
            <ProtectedRouteWrapper>
              <TaskDetail />
            </ProtectedRouteWrapper>
          }
        />

        {/* Redirección por defecto */}
        <Route path="/" element={<Navigate to="/tasks" replace />} />
        <Route path="*" element={<Navigate to="/tasks" replace />} />
      </IonRouterOutlet>
    </IonReactRouter>
  );
};

/**
 * Componente Raíz de la Aplicación
 * Envuelve el árbol de componentes con los dos Context Providers: AuthProvider y TasksProvider
 */
const App: React.FC = () => {
  return (
    <IonApp>
      <AuthProvider>
        <TasksProvider>
          <AppRoutes />
        </TasksProvider>
      </AuthProvider>
    </IonApp>
  );
};

export default App;
