import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Capacitor, SystemBars, SystemBarsStyle } from '@capacitor/core';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import App from './App';

// En el telefono: iconos oscuros en la barra de estado (hora, bateria, notificaciones)
// para que se lean sobre el fondo claro de la app.
if (Capacitor.isNativePlatform()) {
  SystemBars.setStyle({ style: SystemBarsStyle.Light }).catch(() => {
    /* version de Android sin soporte: se mantiene el estilo del tema nativo */
  });
} else {
  // En el navegador, @capacitor/camera usa estos componentes para la camara web.
  defineCustomElements(window);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
