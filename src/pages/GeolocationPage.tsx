// src/pages/GeolocationPage.tsx
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
  IonBadge,
  IonSpinner
} from '@ionic/react';
import {
  locateOutline,
  playOutline,
  stopOutline,
  navigateOutline,
  alertCircleOutline
} from 'ionicons/icons';
import { useGeolocation } from '../hooks/useGeolocation';

const GeolocationPage: React.FC = () => {
  const {
    position,
    watchId,
    error,
    getCurrentLocation,
    startTracking,
    stopTracking
  } = useGeolocation();

  const isTracking = Boolean(watchId);
  const coords = position?.coords;

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Geolocalizacion GPS</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        <div className="sensor-grid-container">
          {/* Tarjeta de estado de telemetria */}
          <div className="telemetry-card">
            <div className="telemetry-card-header">
              <h2 className="telemetry-card-title">
                <IonIcon icon={navigateOutline} />
                Coordenadas Satelitales (GPS)
              </h2>
              <IonBadge color={isTracking ? 'success' : 'medium'}>
                {isTracking ? 'TRACKING EN VIVO' : 'ESTATICO'}
              </IonBadge>
            </div>

            <div className="telemetry-card-content">
              {error && (
                <div style={{ padding: '10px 12px', background: '#fef2f2', border: '1px solid #f87171', borderRadius: '6px', color: '#991b1b', fontSize: '0.82rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IonIcon icon={alertCircleOutline} style={{ fontSize: '1.2rem', flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              {coords ? (
                <div>
                  <div className="telemetry-display-box">
                    <div>LAT: {coords.latitude.toFixed(6)}</div>
                    <div>LNG: {coords.longitude.toFixed(6)}</div>
                    <div>ACCURACY: {coords.accuracy ? `${coords.accuracy.toFixed(1)} m` : 'N/A'}</div>
                  </div>

                  <div className="telemetry-row">
                    <span className="telemetry-label">Latitud</span>
                    <span className="telemetry-val">{coords.latitude.toFixed(6)}°</span>
                  </div>
                  <div className="telemetry-row">
                    <span className="telemetry-label">Longitud</span>
                    <span className="telemetry-val">{coords.longitude.toFixed(6)}°</span>
                  </div>
                  <div className="telemetry-row">
                    <span className="telemetry-label">Precision</span>
                    <span className="telemetry-val">{coords.accuracy ? `${coords.accuracy.toFixed(2)} metros` : 'N/D'}</span>
                  </div>
                  <div className="telemetry-row">
                    <span className="telemetry-label">Altitud</span>
                    <span className="telemetry-val">{coords.altitude !== null && coords.altitude !== undefined ? `${coords.altitude.toFixed(1)} m` : 'N/D'}</span>
                  </div>
                  <div className="telemetry-row">
                    <span className="telemetry-label">Velocidad</span>
                    <span className="telemetry-val">{coords.speed !== null && coords.speed !== undefined ? `${(coords.speed * 3.6).toFixed(1)} km/h` : '0.0 km/h'}</span>
                  </div>
                  <div className="telemetry-row">
                    <span className="telemetry-label">Marca temporal</span>
                    <span className="telemetry-val" style={{ fontSize: '0.78rem' }}>
                      {new Date(position.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ) : (
                <p style={{ margin: '14px 0', fontSize: '0.90rem', color: '#64748b', textAlign: 'center' }}>
                  No se ha obtenido posicion GPS aun. Presiona un boton abajo para iniciar.
                </p>
              )}
            </div>
          </div>

          {/* Botones de accion */}
          <div className="telemetry-card">
            <div className="telemetry-card-content">
              <IonButton
                expand="block"
                className="btn-sensor-action"
                onClick={() => getCurrentLocation()}
              >
                <IonIcon slot="start" icon={locateOutline} />
                Obtener Posicion Actual
              </IonButton>

              {!isTracking ? (
                <IonButton
                  expand="block"
                  color="success"
                  fill="outline"
                  className="btn-sensor-action"
                  onClick={() => startTracking()}
                >
                  <IonIcon slot="start" icon={playOutline} />
                  Iniciar Tracking en Vivo
                </IonButton>
              ) : (
                <IonButton
                  expand="block"
                  color="danger"
                  className="btn-sensor-action"
                  onClick={() => stopTracking()}
                >
                  <IonIcon slot="start" icon={stopOutline} />
                  Detener Tracking en Vivo
                </IonButton>
              )}
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default GeolocationPage;
