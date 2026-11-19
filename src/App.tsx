import { IonApp, setupIonicReact } from '@ionic/react';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import AppRoutes from './routes/AppRoutes';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@fontsource/plus-jakarta-sans/400.css';
import '@fontsource/plus-jakarta-sans/500.css';
import '@fontsource/plus-jakarta-sans/600.css';
import '@fontsource/plus-jakarta-sans/700.css';
import '@fontsource/plus-jakarta-sans/800.css';
import './theme/variables.css';
import './theme/global.scss';

// Transiciones nativas de iOS en todas las plataformas: deslizamiento suave entre vistas.
setupIonicReact({ mode: 'ios', swipeBackEnabled: true });

export default function App() {
  return (
    <IonApp>
      <AuthProvider>
        <AppProvider>
          <AppRoutes />
        </AppProvider>
      </AuthProvider>
    </IonApp>
  );
}
