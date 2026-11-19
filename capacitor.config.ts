import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.desarrollomovil.manada',
  appName: 'Manada',
  webDir: 'dist',
  plugins: {
    // Barra de estado con iconos oscuros sobre el fondo claro de la app.
    SystemBars: {
      style: 'LIGHT',
      insetsHandling: 'css',
      initialViewportFitValueHint: 'cover'
    }
  }
};

export default config;
