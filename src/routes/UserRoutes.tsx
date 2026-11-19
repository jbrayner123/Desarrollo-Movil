import { IonRouterOutlet } from '@ionic/react';
import { Redirect, Route } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Feed from '../pages/Feed/Feed';
import MapPage from '../pages/Map/Map';
import CreatePost from '../pages/CreatePost/CreatePost';
import Vets from '../pages/Vets/Vets';
import VetDetail from '../pages/Vets/VetDetail';
import MyBusiness from '../pages/MyBusiness/MyBusiness';
import Profile from '../pages/Profile/Profile';
import Chat from '../pages/Chat/Chat';

/**
 * Rutas de la app para cualquier cuenta con sesion (/app/*).
 * "Mi negocio" solo existe para veterinarias y petshops.
 * AppRoutes ya valida la sesion antes de mostrar estas rutas.
 */
export default function UserRoutes() {
  const { isBusiness } = useAuth();

  return (
    <IonRouterOutlet>
      <Route exact path="/app/inicio" component={Feed} />
      <Route exact path="/app/mapa" component={MapPage} />
      <Route exact path="/app/crear" component={CreatePost} />
      <Route exact path="/app/servicios" component={Vets} />
      <Route exact path="/app/negocio/:id" component={VetDetail} />
      <Route exact path="/app/mi-negocio" render={() => (isBusiness ? <MyBusiness /> : <Redirect to="/app/servicios" />)} />
      <Route exact path="/app/perfil" component={Profile} />
      <Route exact path="/app/chat/:id" component={Chat} />
      <Route exact path="/app">
        <Redirect to="/app/inicio" />
      </Route>
    </IonRouterOutlet>
  );
}
