import { IonRouterOutlet } from '@ionic/react';
import { Redirect, Route } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Admin from '../pages/Admin/Admin';

/**
 * Rutas de administracion (/admin/*). Requieren el rol "admin" en users/{uid};
 * cualquier otra cuenta vuelve al feed. Las reglas de Firestore aplican la misma
 * restriccion en el servidor.
 */
export default function AdminRoutes() {
  const { isAdmin } = useAuth();
  if (!isAdmin) return <Redirect to="/app/inicio" />;

  return (
    <IonRouterOutlet>
      <Route exact path="/admin" component={Admin} />
    </IonRouterOutlet>
  );
}
