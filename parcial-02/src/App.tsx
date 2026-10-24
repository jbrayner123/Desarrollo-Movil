// parcial-02/src/App.tsx
import React from 'react';
import { Route, Navigate, Routes } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact, IonSpinner } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';

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

/* Meetgen theme variables */
import './theme/variables.css';

setupIonicReact({
  mode: 'md'
});

const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: 'var(--color-cream-base)',
          color: 'var(--color-charcoal-dark)'
        }}
      >
        <IonSpinner name="crescent" style={{ width: 36, height: 36, color: 'var(--color-terracotta)' }} />
        <p style={{ marginTop: 12, fontSize: '0.85rem', color: '#8E8B82', letterSpacing: '0.04em', fontWeight: 600 }}>
          INICIALIZANDO SISTEMA DE MISIONES...
        </p>
      </div>
    );
  }

  return (
    <IonRouterOutlet>
      <Routes>
        <Route
          path="/auth"
          element={user ? <Navigate to="/dashboard" replace /> : <AuthPage />}
        />
        <Route
          path="/dashboard"
          element={user ? <DashboardPage /> : <Navigate to="/auth" replace />}
        />
        <Route
          path="/"
          element={<Navigate to={user ? '/dashboard' : '/auth'} replace />}
        />
        <Route
          path="*"
          element={<Navigate to={user ? '/dashboard' : '/auth'} replace />}
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
