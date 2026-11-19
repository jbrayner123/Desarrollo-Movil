import type { ReactElement } from 'react';
import { IonContent, IonIcon, IonPage, IonRouterOutlet, IonSpinner } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route } from 'react-router-dom';
import { pawOutline } from 'ionicons/icons';
import { useAuth } from '../context/AuthContext';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import UserRoutes from './UserRoutes';
import AdminRoutes from './AdminRoutes';
import OfflineBanner from '../components/Shared/OfflineBanner';
import BottomMenu from '../components/Shared/BottomMenu';
import styles from './AppRoutes.module.scss';

/** Pantalla de carga mientras Firebase restaura la sesion. */
function Splash() {
  return (
    <IonPage>
      <IonContent>
        <div className={styles.splash}>
          <span className={styles.logo}>
            <IonIcon icon={pawOutline} aria-hidden="true" />
          </span>
          <IonSpinner name="dots" />
        </div>
      </IonContent>
    </IonPage>
  );
}

/** Cuenta autenticada sin perfil en Firestore (registro interrumpido). */
function MissingProfile() {
  const { logout } = useAuth();
  return (
    <IonPage>
      <IonContent>
        <div className={styles.splash}>
          <h1>No encontramos tu perfil.</h1>
          <p>El registro no se completó. Cierra sesión y vuelve a registrarte.</p>
          <button type="button" className={styles.button} onClick={() => logout()}>
            Cerrar sesión
          </button>
        </div>
      </IonContent>
    </IonPage>
  );
}

/**
 * Enrutador raiz con proteccion por sesion y rol:
 * - /login y /registro: publicas; con sesion lista redirigen al feed.
 * - /app/*: requiere sesion (UserRoutes).
 * - /admin/*: requiere rol admin (AdminRoutes).
 */
export default function AppRoutes() {
  const { status } = useAuth();
  const ready = status === 'ready';

  const guarded = (content: ReactElement) => {
    if (status === 'signedOut') return <Redirect to="/login" />;
    if (status === 'missingProfile') return <MissingProfile />;
    if (!ready) return <Splash />;
    return content;
  };

  return (
    <IonReactRouter>
      <OfflineBanner />
      <IonRouterOutlet>
        <Route exact path="/login" render={() => (ready ? <Redirect to="/app/inicio" /> : <Login />)} />
        <Route exact path="/registro" render={() => (ready ? <Redirect to="/app/inicio" /> : <Register />)} />
        <Route path="/app" render={() => guarded(<UserRoutes />)} />
        <Route path="/admin" render={() => guarded(<AdminRoutes />)} />
        <Route exact path="/">
          {status === 'loading' ? <Splash /> : <Redirect to={ready ? '/app/inicio' : '/login'} />}
        </Route>
      </IonRouterOutlet>
      {/* Una sola barra, fuera del outlet: Ionic conserva paginas anteriores en memoria
          con su ruta congelada y una barra dentro de ellas quedaria desactualizada. */}
      {ready && <BottomMenu />}
    </IonReactRouter>
  );
}
