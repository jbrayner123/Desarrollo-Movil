// src/pages/NetworkPage.tsx
import React from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonIcon,
  IonBadge
} from '@ionic/react';
import {
  wifiOutline,
  cellularOutline,
  cloudOfflineOutline,
  radioOutline
} from 'ionicons/icons';
import { useNetwork } from '../hooks/useNetwork';

const NetworkPage: React.FC = () => {
  const { isOnline, connectionType } = useNetwork();

  const getIcon = () => {
    if (!isOnline) return cloudOfflineOutline;
    if (connectionType === 'cellular') return cellularOutline;
    return wifiOutline;
  };

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Sensor de Red</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        <div className="sensor-grid-container">
          <div className="telemetry-card">
            <div className="telemetry-card-header">
              <h2 className="telemetry-card-title">
                <IonIcon icon={radioOutline} />
                Estado del Sensor @capacitor/network
              </h2>
              <IonBadge color={isOnline ? 'success' : 'danger'}>
                {isOnline ? 'ONLINE' : 'OFFLINE'}
              </IonBadge>
            </div>

            <div className="telemetry-card-content">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px',
                  borderRadius: '8px',
                  background: isOnline ? '#f0fdf4' : '#fef2f2',
                  border: `1px solid ${isOnline ? '#bbf7d0' : '#fecaca'}`,
                  marginBottom: '16px'
                }}
              >
                <IonIcon
                  icon={getIcon()}
                  style={{
                    fontSize: '2.5rem',
                    color: isOnline ? '#16a34a' : '#dc2626'
                  }}
                />
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>
                    {isOnline ? 'Conexion a Internet Detectada' : 'Sin Conexion a Internet'}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                    Tipo de red: <strong>{connectionType.toUpperCase()}</strong>
                  </p>
                </div>
              </div>

              <div className="telemetry-row">
                <span className="telemetry-label">Conectado (isOnline)</span>
                <span className="telemetry-val">{isOnline ? 'true' : 'false'}</span>
              </div>
              <div className="telemetry-row">
                <span className="telemetry-label">Tipo de Conexion</span>
                <span className="telemetry-val">{connectionType}</span>
              </div>
              <div className="telemetry-row">
                <span className="telemetry-label">Sensor Nativo</span>
                <span className="telemetry-val">@capacitor/network</span>
              </div>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default NetworkPage;
