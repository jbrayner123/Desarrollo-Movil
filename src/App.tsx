import React from 'react';
import { Route, Navigate, Routes } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact, IonSpinner } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthPage } from './pages/AuthPage';
import { TasksPage } from './pages/TasksPage';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact({
  mode: 'md'
});

const AppRoutes: React.FC = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: '#0b1120',
          color: '#f8fafc'
        }}
      >
        <IonSpinner name="crescent" style={{ width: 36, height: 36, color: '#0284c7' }} />
        <p style={{ marginTop: 12, fontSize: '0.85rem', color: '#64748b', letterSpacing: '0.04em' }}>
          VERIFICANDO SESION DE SUPABASE...
        </p>
      </div>
    );
  }

  return (
    <IonRouterOutlet>
      <Routes>
        <Route
          path="/auth"
          element={session ? <Navigate to="/tasks" replace /> : <AuthPage />}
        />
        <Route
          path="/tasks"
          element={session ? <TasksPage /> : <Navigate to="/auth" replace />}
        />
        <Route
          path="/"
          element={<Navigate to={session ? '/tasks' : '/auth'} replace />}
        />
        <Route
          path="*"
          element={<Navigate to={session ? '/tasks' : '/auth'} replace />}
        />
      </Routes>
    </IonRouterOutlet>
  );
};

export const App: React.FC = () => {
  return (
    <IonApp>
      <AuthProvider>
        <IonReactRouter>
          <AppRoutes />
        </IonReactRouter>
      </AuthProvider>
    </IonApp>
  );
};

export default App;
