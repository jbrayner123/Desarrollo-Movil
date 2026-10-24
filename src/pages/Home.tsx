// src/pages/Home.tsx
import React from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonBadge,
  useIonRouter
} from '@ionic/react';
import {
  locateOutline,
  cameraOutline,
  speedometerOutline,
  phonePortraitOutline,
  pulseOutline,
  folderOpenOutline,
  notificationsOutline,
  radioOutline,
  wifiOutline,
  chevronForwardOutline,
  hardwareChipOutline
} from 'ionicons/icons';
import { useNetwork } from '../hooks/useNetwork';

interface SensorItem {
  route: string;
  name: string;
  tag: string;
  description: string;
  icon: string;
  color: string;
}

const SENSORS: SensorItem[] = [
  {
    route: '/geolocation',
    name: 'Geolocalizacion GPS',
    tag: '@capacitor/geolocation',
    description: 'Coordenadas geograficas, precision, altitud y rastreo continuo en tiempo real.',
    icon: locateOutline,
    color: 'primary'
  },
  {
    route: '/camera',
    name: 'Camara & Galeria',
    tag: '@capacitor/camera',
    description: 'Captura nativa de fotografias con previsualizacion y resolucion de ruta web.',
    icon: cameraOutline,
    color: 'secondary'
  },
  {
    route: '/accelerometer',
    name: 'Acelerometro & Movimiento',
    tag: '@capacitor/motion',
    description: 'Telemetria triaxial (X, Y, Z), magnitud y detector de agitacion (Shake).',
    icon: speedometerOutline,
    color: 'tertiary'
  },
  {
    route: '/device',
    name: 'Dispositivo & Bateria',
    tag: '@capacitor/device',
    description: 'Nivel y estado de carga de bateria, modelo, sistema operativo e ID unico.',
    icon: phonePortraitOutline,
    color: 'primary'
  },
  {
    route: '/haptics',
    name: 'Motor Haptico & Vibracion',
    tag: '@capacitor/haptics',
    description: 'Patrones de impacto suave, medio, fuerte, notificaciones de exito/error y vibracion.',
    icon: pulseOutline,
    color: 'secondary'
  },
  {
    route: '/filesystem',
    name: 'Sistema de Archivos',
    tag: '@capacitor/filesystem',
    description: 'Lectura, escritura, listado de directorio y eliminacion en Directory.Documents.',
    icon: folderOpenOutline,
    color: 'tertiary'
  },
  {
    route: '/local-notifications',
    name: 'Notificaciones Locales',
    tag: '@capacitor/local-notifications',
    description: 'Permisos del sistema, envio inmediato y programacion temporal en segundo plano.',
    icon: notificationsOutline,
    color: 'primary'
  },
  {
    route: '/push-notifications',
    name: 'Notificaciones Push (FCM)',
    tag: '@capacitor/push-notifications',
    description: 'Registro de token nativo, recepcion de mensajes y manejo de eventos.',
    icon: radioOutline,
    color: 'secondary'
  },
  {
    route: '/network',
    name: 'Sensor de Red & Conexion',
    tag: '@capacitor/network',
    description: 'Estado de conectividad activo, tipo de interfaz (Wi-Fi, Celular) y listener.',
    icon: wifiOutline,
    color: 'tertiary'
  }
];

const Home: React.FC = () => {
  const router = useIonRouter();
  const { isOnline, connectionType } = useNetwork();

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar color="primary">
          <IonTitle>Sensores Lab - Challenge 07</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        <div className="sensor-grid-container">
          {/* Ficha encabezado de telemetria */}
          <div className="telemetry-card">
            <div className="telemetry-card-header">
              <h2 className="telemetry-card-title">
                <IonIcon icon={hardwareChipOutline} />
                Panel de Diagnostico de Hardware
              </h2>
              <IonBadge color={isOnline ? 'success' : 'danger'}>
                {isOnline ? connectionType.toUpperCase() : 'OFFLINE'}
              </IonBadge>
            </div>
            <div className="telemetry-card-content">
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5 }}>
                Laboratorio integral de sensores nativos compilado para Android con Capacitor y Ionic React. Selecciona un modulo para iniciar la telemetria o prueba interactiva.
              </p>
            </div>
          </div>

          {/* Grid de Sensores */}
          {SENSORS.map((sensor) => (
            <IonCard
              key={sensor.route}
              className="telemetry-card"
              style={{ cursor: 'pointer', transition: 'border-color 0.15s ease' }}
              onClick={() => router.push(sensor.route, 'forward', 'push')}
            >
              <IonCardHeader style={{ padding: '14px 16px 8px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--ion-color-step-100, #f1f5f9)',
                        color: 'var(--ion-color-primary, #0284c7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem'
                      }}
                    >
                      <IonIcon icon={sensor.icon} />
                    </div>
                    <div>
                      <IonCardTitle style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
                        {sensor.name}
                      </IonCardTitle>
                      <IonCardSubtitle style={{ fontSize: '0.74rem', fontFamily: 'var(--telemetry-font-mono)', marginTop: '2px' }}>
                        {sensor.tag}
                      </IonCardSubtitle>
                    </div>
                  </div>
                  <IonIcon icon={chevronForwardOutline} color="medium" style={{ fontSize: '1.2rem' }} />
                </div>
              </IonCardHeader>

              <IonCardContent style={{ padding: '4px 16px 14px 16px' }}>
                <p style={{ margin: 0, fontSize: '0.84rem', color: '#475569', lineHeight: 1.4 }}>
                  {sensor.description}
                </p>
                <div style={{ marginTop: '10px' }}>
                  <IonButton
                    expand="block"
                    fill="outline"
                    size="small"
                    className="btn-sensor-action"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(sensor.route, 'forward', 'push');
                    }}
                  >
                    Abrir Prueba de {sensor.name.split(' ')[0]}
                  </IonButton>
                </div>
              </IonCardContent>
            </IonCard>
          ))}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
