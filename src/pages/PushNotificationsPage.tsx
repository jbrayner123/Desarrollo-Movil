// src/pages/PushNotificationsPage.tsx
import React, { useState } from 'react';
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
  radioOutline,
  copyOutline,
  notificationsOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
  shieldCheckmarkOutline
} from 'ionicons/icons';
import { usePushNotifications } from '../hooks/usePushNotifications';

const PushNotificationsPage: React.FC = () => {
  const {
    token,
    notification,
    lastAction,
    error,
    isRegistered,
    requestPermission
  } = usePushNotifications();

  const [copied, setCopied] = useState<boolean>(false);

  const copyToClipboard = async () => {
    if (token && typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Notificaciones Push (FCM)</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        <div className="sensor-grid-container">
          {error && (
            <div style={{ padding: '10px 12px', background: '#fef2f2', border: '1px solid #f87171', borderRadius: '6px', color: '#991b1b', fontSize: '0.82rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IonIcon icon={alertCircleOutline} style={{ fontSize: '1.2rem', flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Estado de Registro FCM */}
          <div className="telemetry-card">
            <div className="telemetry-card-header">
              <h2 className="telemetry-card-title">
                <IonIcon icon={radioOutline} />
                Estado del Servicio Push
              </h2>
              <IonBadge color={token ? 'success' : isRegistered ? 'warning' : 'medium'}>
                {token ? 'REGISTRADO' : isRegistered ? 'ESPERANDO TOKEN' : 'INACTIVO'}
              </IonBadge>
            </div>

            <div className="telemetry-card-content">
              <p style={{ margin: '0 0 12px 0', fontSize: '0.86rem', color: '#64748b', lineHeight: 1.5 }}>
                El registro Push inicializa el SDK nativo de Firebase Cloud Messaging y genera un token unico para envio desde consolas remotas o servidores backend.
              </p>

              <IonButton
                expand="block"
                className="btn-sensor-action"
                onClick={() => requestPermission()}
              >
                <IonIcon slot="start" icon={shieldCheckmarkOutline} />
                Solicitar Permisos & Registrar en FCM
              </IonButton>
            </div>
          </div>

          {/* Token de Dispositivo */}
          <div className="telemetry-card">
            <div className="telemetry-card-header">
              <h2 className="telemetry-card-title">
                <IonIcon icon={radioOutline} />
                Token de Dispositivo FCM
              </h2>
              {copied && <IonBadge color="success">COPIADO</IonBadge>}
            </div>

            <div className="telemetry-card-content">
              <div className="telemetry-display-box" style={{ fontSize: '0.78rem' }}>
                <div style={{ color: '#94a3b8', marginBottom: '4px' }}>REGISTRATION TOKEN:</div>
                <div style={{ maxHeight: '100px', overflowY: 'auto' }}>
                  {token || 'Token no generado todavia. Presiona "Registrar en FCM" arriba en tu celular fisico.'}
                </div>
              </div>

              {token && (
                <IonButton
                  expand="block"
                  fill="outline"
                  className="btn-sensor-action"
                  onClick={copyToClipboard}
                >
                  <IonIcon slot="start" icon={copyOutline} />
                  Copiar Token al Portapapeles
                </IonButton>
              )}
            </div>
          </div>

          {/* Ultima Notificacion Recibida */}
          <div className="telemetry-card">
            <div className="telemetry-card-header">
              <h2 className="telemetry-card-title">
                <IonIcon icon={notificationsOutline} />
                Ultima Notificacion Recibida (Foreground)
              </h2>
            </div>

            <div className="telemetry-card-content">
              {notification ? (
                <div>
                  <div className="telemetry-row">
                    <span className="telemetry-label">Titulo</span>
                    <span className="telemetry-val">{notification.title || 'Sin titulo'}</span>
                  </div>
                  <div className="telemetry-row">
                    <span className="telemetry-label">Cuerpo</span>
                    <span className="telemetry-val">{notification.body || 'Sin cuerpo'}</span>
                  </div>
                  <div className="telemetry-row">
                    <span className="telemetry-label">ID Notificacion</span>
                    <span className="telemetry-val">{notification.id || 'N/A'}</span>
                  </div>
                </div>
              ) : (
                <p style={{ margin: '10px 0', fontSize: '0.88rem', color: '#64748b', textAlign: 'center' }}>
                  No se han recibido mensajes Push en esta sesion.
                </p>
              )}
            </div>
          </div>

          {/* Ultima Accion de Tap */}
          {lastAction && (
            <div className="telemetry-card">
              <div className="telemetry-card-header">
                <h2 className="telemetry-card-title">
                  <IonIcon icon={checkmarkCircleOutline} />
                  Interaccion con Notificacion
                </h2>
              </div>
              <div className="telemetry-card-content">
                <div className="telemetry-display-box" style={{ fontSize: '0.80rem' }}>
                  <div>ACCION: {lastAction.actionId}</div>
                  <div>TITULO: {lastAction.notification?.title}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default PushNotificationsPage;
