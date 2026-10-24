// src/pages/LocalNotificationsPage.tsx
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
  IonBadge,
  IonItem,
  IonInput,
  IonTextarea
} from '@ionic/react';
import {
  notificationsOutline,
  timeOutline,
  checkmarkCircleOutline,
  keyOutline,
  alertCircleOutline,
  flashOutline
} from 'ionicons/icons';
import { useLocalNotifications } from '../hooks/useLocalNotifications';

const LocalNotificationsPage: React.FC = () => {
  const {
    permission,
    lastAction,
    error,
    requestPermission,
    sendNotification,
    scheduleNotification
  } = useLocalNotifications();

  const [title, setTitle] = useState<string>('Alerta de Sensores');
  const [body, setBody] = useState<string>('Telemetria completada exitosamente en segundo plano.');
  const [seconds, setSeconds] = useState<number>(5);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleSendImmediate = async () => {
    try {
      const id = await sendNotification({
        title,
        body
      });
      setStatusMsg(`Notificacion inmediata enviada (ID: ${id}).`);
    } catch {
      // error en hook
    }
  };

  const handleSchedule = async () => {
    try {
      const id = await scheduleNotification({
        title,
        body,
        seconds
      });
      setStatusMsg(`Notificacion programada para dispararse en ${seconds} segundos (ID: ${id}).`);
    } catch {
      // error en hook
    }
  };

  const isGranted = permission?.display === 'granted';

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Notificaciones Locales</IonTitle>
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

          {statusMsg && (
            <div style={{ padding: '8px 12px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '6px', color: '#166534', fontSize: '0.82rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IonIcon icon={checkmarkCircleOutline} style={{ fontSize: '1.1rem', flexShrink: 0 }} />
              <span>{statusMsg}</span>
            </div>
          )}

          {/* Ficha de Permisos */}
          <div className="telemetry-card">
            <div className="telemetry-card-header">
              <h2 className="telemetry-card-title">
                <IonIcon icon={keyOutline} />
                Estado de Permisos Nativos
              </h2>
              <IonBadge color={isGranted ? 'success' : 'danger'}>
                {permission?.display?.toUpperCase() || 'NO SOLICITADO'}
              </IonBadge>
            </div>
            <div className="telemetry-card-content">
              <div className="telemetry-display-box">
                <div>DISPLAY PERMISSION: {permission?.display || 'prompt'}</div>
                <div>CAN SCHEDULE EXACT: {permission ? 'SI' : 'PENDIENTE'}</div>
              </div>

              {!isGranted && (
                <IonButton
                  expand="block"
                  color="warning"
                  className="btn-sensor-action"
                  onClick={() => requestPermission()}
                >
                  <IonIcon slot="start" icon={keyOutline} />
                  Solicitar Permiso de Notificaciones
                </IonButton>
              )}
            </div>
          </div>

          {/* Editor de Notificacion */}
          <div className="telemetry-card">
            <div className="telemetry-card-header">
              <h2 className="telemetry-card-title">
                <IonIcon icon={notificationsOutline} />
                Disparador de Notificaciones
              </h2>
            </div>
            <div className="telemetry-card-content">
              <IonItem lines="none" style={{ border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '12px' }}>
                <IonInput
                  label="Titulo de la notificacion *"
                  labelPlacement="floating"
                  value={title}
                  onIonInput={(e) => setTitle(e.detail.value || '')}
                />
              </IonItem>

              <IonItem lines="none" style={{ border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '12px' }}>
                <IonTextarea
                  label="Cuerpo / Mensaje *"
                  labelPlacement="floating"
                  rows={2}
                  value={body}
                  onIonInput={(e) => setBody(e.detail.value || '')}
                />
              </IonItem>

              <IonItem lines="none" style={{ border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '16px' }}>
                <IonInput
                  label="Segundos de programacion"
                  labelPlacement="floating"
                  type="number"
                  value={seconds}
                  onIonInput={(e) => setSeconds(Number(e.detail.value) || 5)}
                />
              </IonItem>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <IonButton
                  expand="block"
                  className="btn-sensor-action"
                  onClick={handleSendImmediate}
                >
                  <IonIcon slot="start" icon={flashOutline} />
                  Enviar Ahora
                </IonButton>

                <IonButton
                  expand="block"
                  color="tertiary"
                  className="btn-sensor-action"
                  onClick={handleSchedule}
                >
                  <IonIcon slot="start" icon={timeOutline} />
                  Programar ({seconds}s)
                </IonButton>
              </div>
            </div>
          </div>

          {/* Registro de Interaccion */}
          {lastAction && (
            <div className="telemetry-card">
              <div className="telemetry-card-header">
                <h2 className="telemetry-card-title">
                  <IonIcon icon={checkmarkCircleOutline} />
                  Ultima Accion de Notificacion
                </h2>
              </div>
              <div className="telemetry-card-content">
                <div className="telemetry-display-box" style={{ fontSize: '0.80rem' }}>
                  <div>ACCION ID: {lastAction.actionId}</div>
                  <div>NOTIF ID: {lastAction.notification?.id}</div>
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

export default LocalNotificationsPage;
