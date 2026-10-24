// src/pages/HapticsPage.tsx
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
  IonRadioGroup,
  IonRadio,
  IonItem,
  IonLabel,
  IonList
} from '@ionic/react';
import {
  pulseOutline,
  checkmarkCircleOutline,
  warningOutline,
  closeCircleOutline,
  radioOutline,
  hammerOutline
} from 'ionicons/icons';
import { useHaptics } from '../hooks/useHaptics';

const HapticsPage: React.FC = () => {
  const {
    isAvailable,
    impact,
    notify,
    vibrate,
    selectionStart,
    selectionChanged,
    selectionEnd
  } = useHaptics();

  const [lastFeedback, setLastFeedback] = useState<string>('Esperando interaccion...');
  const [selectedRadio, setSelectedRadio] = useState<string>('opcion1');

  const triggerImpact = async (style: 'light' | 'medium' | 'heavy') => {
    setLastFeedback(`Impacto Tactil: ${style.toUpperCase()}`);
    await impact(style);
  };

  const triggerNotify = async (type: 'success' | 'warning' | 'error') => {
    setLastFeedback(`Notificacion Haptica: ${type.toUpperCase()}`);
    await notify(type);
  };

  const triggerVibrate = async (ms: number) => {
    setLastFeedback(`Vibracion pura: ${ms} ms`);
    await vibrate(ms);
  };

  const handleRadioChange = async (val: string) => {
    await selectionStart();
    setSelectedRadio(val);
    await selectionChanged();
    await selectionEnd();
    setLastFeedback(`Seleccion haptica: ${val}`);
  };

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Motor Haptico & Vibracion</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        <div className="sensor-grid-container">
          <div className="telemetry-card">
            <div className="telemetry-card-header">
              <h2 className="telemetry-card-title">
                <IonIcon icon={pulseOutline} />
                Control de Retroalimentacion Haptica
              </h2>
              <IonBadge color={isAvailable ? 'success' : 'medium'}>
                {isAvailable ? 'MOTOR ACTIVO' : 'NO DISPONIBLE'}
              </IonBadge>
            </div>

            <div className="telemetry-card-content">
              <div className="telemetry-display-box">
                <div style={{ color: '#94a3b8', marginBottom: '4px' }}>ULTIMO FEEDBACK:</div>
                <div>{lastFeedback}</div>
              </div>
            </div>
          </div>

          {/* Grupo 1: Impactos de Choque */}
          <div className="telemetry-card">
            <div className="telemetry-card-header">
              <h2 className="telemetry-card-title">
                <IonIcon icon={hammerOutline} />
                Pruebas de Impacto (ImpactStyle)
              </h2>
            </div>
            <div className="telemetry-card-content">
              <IonButton
                expand="block"
                fill="outline"
                className="btn-sensor-action"
                onClick={() => triggerImpact('light')}
              >
                Impacto Suave (Light)
              </IonButton>
              <IonButton
                expand="block"
                color="primary"
                className="btn-sensor-action"
                onClick={() => triggerImpact('medium')}
              >
                Impacto Medio (Medium)
              </IonButton>
              <IonButton
                expand="block"
                color="dark"
                className="btn-sensor-action"
                onClick={() => triggerImpact('heavy')}
              >
                Impacto Fuerte (Heavy)
              </IonButton>
            </div>
          </div>

          {/* Grupo 2: Notificaciones */}
          <div className="telemetry-card">
            <div className="telemetry-card-header">
              <h2 className="telemetry-card-title">
                <IonIcon icon={radioOutline} />
                Patrones de Notificacion (NotificationType)
              </h2>
            </div>
            <div className="telemetry-card-content">
              <IonButton
                expand="block"
                color="success"
                className="btn-sensor-action"
                onClick={() => triggerNotify('success')}
              >
                <IonIcon slot="start" icon={checkmarkCircleOutline} />
                Notificacion Exito (Success)
              </IonButton>
              <IonButton
                expand="block"
                color="warning"
                className="btn-sensor-action"
                onClick={() => triggerNotify('warning')}
              >
                <IonIcon slot="start" icon={warningOutline} />
                Notificacion Advertencia (Warning)
              </IonButton>
              <IonButton
                expand="block"
                color="danger"
                className="btn-sensor-action"
                onClick={() => triggerNotify('error')}
              >
                <IonIcon slot="start" icon={closeCircleOutline} />
                Notificacion Error (Error)
              </IonButton>
            </div>
          </div>

          {/* Grupo 3: Vibracion libre y seleccion */}
          <div className="telemetry-card">
            <div className="telemetry-card-header">
              <h2 className="telemetry-card-title">
                <IonIcon icon={pulseOutline} />
                Vibracion Personalizada & Seleccion
              </h2>
            </div>
            <div className="telemetry-card-content">
              <IonButton
                expand="block"
                color="secondary"
                className="btn-sensor-action"
                onClick={() => triggerVibrate(200)}
              >
                Vibracion Directa (200 ms)
              </IonButton>

              <div style={{ marginTop: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>
                  Prueba de eventos SelectionChanged:
                </p>
                <IonRadioGroup
                  value={selectedRadio}
                  onIonChange={(e) => handleRadioChange(e.detail.value)}
                >
                  <IonList lines="none">
                    <IonItem style={{ border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '6px' }}>
                      <IonRadio slot="start" value="opcion1" />
                      <IonLabel style={{ fontSize: '0.90rem' }}>Opcion A (Pulso Haptico)</IonLabel>
                    </IonItem>
                    <IonItem style={{ border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '6px' }}>
                      <IonRadio slot="start" value="opcion2" />
                      <IonLabel style={{ fontSize: '0.90rem' }}>Opcion B (Pulso Haptico)</IonLabel>
                    </IonItem>
                    <IonItem style={{ border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                      <IonRadio slot="start" value="opcion3" />
                      <IonLabel style={{ fontSize: '0.90rem' }}>Opcion C (Pulso Haptico)</IonLabel>
                    </IonItem>
                  </IonList>
                </IonRadioGroup>
              </div>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default HapticsPage;
