// src/pages/AccelerometerPage.tsx
import React from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonBadge
} from '@ionic/react';
import {
  speedometerOutline,
  playOutline,
  pauseOutline,
  flashOutline,
  warningOutline,
  alertCircleOutline
} from 'ionicons/icons';
import { useAccelerometer } from '../hooks/useAccelerometer';

const AccelerometerPage: React.FC = () => {
  const {
    acceleration,
    magnitude,
    isShaking,
    isMoving,
    isActive,
    error,
    start,
    stop
  } = useAccelerometer({ threshold: 22, interval: 80, shakeDelay: 800 });

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Acelerometro & Movimiento</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        <div className="sensor-grid-container">
          {/* Alerta de Shake prominente */}
          {isShaking && (
            <div className="shake-alert-box">
              <IonIcon icon={warningOutline} style={{ fontSize: '1.5rem', verticalAlign: 'middle', marginRight: '8px' }} />
              ALERTA: SHAKE DETECTADO (AGITACION DEL DISPOSITIVO)
            </div>
          )}

          {error && (
            <div style={{ padding: '10px 12px', background: '#fef2f2', border: '1px solid #f87171', borderRadius: '6px', color: '#991b1b', fontSize: '0.82rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IonIcon icon={alertCircleOutline} style={{ fontSize: '1.2rem', flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Ficha de Telemetria de Ejes */}
          <div className="telemetry-card">
            <div className="telemetry-card-header">
              <h2 className="telemetry-card-title">
                <IonIcon icon={speedometerOutline} />
                Telemetria Triaxial (m/s²)
              </h2>
              <IonBadge color={isActive ? 'success' : 'medium'}>
                {isActive ? 'SENSOR ACTIVO' : 'PAUSADO'}
              </IonBadge>
            </div>

            <div className="telemetry-card-content">
              <div className="telemetry-display-box">
                <div>EJE X: {acceleration.x >= 0 ? `+${acceleration.x.toFixed(2)}` : acceleration.x.toFixed(2)} m/s²</div>
                <div>EJE Y: {acceleration.y >= 0 ? `+${acceleration.y.toFixed(2)}` : acceleration.y.toFixed(2)} m/s²</div>
                <div>EJE Z: {acceleration.z >= 0 ? `+${acceleration.z.toFixed(2)}` : acceleration.z.toFixed(2)} m/s²</div>
                <div style={{ borderTop: '1px solid #334155', marginTop: '6px', paddingTop: '6px', color: '#facc15' }}>
                  MAGNITUD: {magnitude.toFixed(2)} m/s²
                </div>
              </div>

              <div className="telemetry-row">
                <span className="telemetry-label">Eje X (Lateral)</span>
                <span className="telemetry-val">{acceleration.x.toFixed(2)}</span>
              </div>
              <div className="telemetry-row">
                <span className="telemetry-label">Eje Y (Longitudinal)</span>
                <span className="telemetry-val">{acceleration.y.toFixed(2)}</span>
              </div>
              <div className="telemetry-row">
                <span className="telemetry-label">Eje Z (Vertical / Gravedad)</span>
                <span className="telemetry-val">{acceleration.z.toFixed(2)}</span>
              </div>
              <div className="telemetry-row">
                <span className="telemetry-label">Magnitud Vectorial</span>
                <span className="telemetry-val">{magnitude.toFixed(2)}</span>
              </div>
              <div className="telemetry-row">
                <span className="telemetry-label">En Movimiento</span>
                <span className="telemetry-val">
                  <IonBadge color={isMoving ? 'primary' : 'light'} style={{ fontSize: '0.78rem' }}>
                    {isMoving ? 'SI (EN MOVIMIENTO)' : 'NO (ESTATICO)'}
                  </IonBadge>
                </span>
              </div>
              <div className="telemetry-row">
                <span className="telemetry-label">Estado de Agitacion</span>
                <span className="telemetry-val">
                  <IonBadge color={isShaking ? 'danger' : 'success'} style={{ fontSize: '0.78rem' }}>
                    {isShaking ? 'SHAKE ACTIVO' : 'NORMAL'}
                  </IonBadge>
                </span>
              </div>
            </div>
          </div>

          {/* Controles de Listener */}
          <div className="telemetry-card">
            <div className="telemetry-card-content">
              {isActive ? (
                <IonButton
                  expand="block"
                  color="warning"
                  className="btn-sensor-action"
                  onClick={() => stop()}
                >
                  <IonIcon slot="start" icon={pauseOutline} />
                  Pausar Telemetria de Movimiento
                </IonButton>
              ) : (
                <IonButton
                  expand="block"
                  color="success"
                  className="btn-sensor-action"
                  onClick={() => start()}
                >
                  <IonIcon slot="start" icon={playOutline} />
                  Reanudar Telemetria de Movimiento
                </IonButton>
              )}
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AccelerometerPage;
