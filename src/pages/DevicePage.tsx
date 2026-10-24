// src/pages/DevicePage.tsx
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
  phonePortraitOutline,
  refreshOutline,
  batteryChargingOutline,
  batteryFullOutline,
  hardwareChipOutline,
  fingerPrintOutline,
  alertCircleOutline
} from 'ionicons/icons';
import { useDevice } from '../hooks/useDevice';

const DevicePage: React.FC = () => {
  const { battery, info, deviceId, loading, error, refresh } = useDevice();

  const batteryPercent = battery?.batteryLevel !== undefined
    ? Math.round(battery.batteryLevel * 100)
    : null;

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Dispositivo & Bateria</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => refresh()} title="Refrescar">
              <IonIcon slot="icon-only" icon={refreshOutline} />
            </IonButton>
          </IonButtons>
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

          {/* Estado de Bateria */}
          <div className="telemetry-card">
            <div className="telemetry-card-header">
              <h2 className="telemetry-card-title">
                <IonIcon icon={battery?.isCharging ? batteryChargingOutline : batteryFullOutline} />
                Gestion de Energia & Bateria
              </h2>
              <IonBadge color={battery?.isCharging ? 'success' : batteryPercent && batteryPercent < 20 ? 'danger' : 'primary'}>
                {battery?.isCharging ? 'CARGANDO' : 'DESCARGANDO'}
              </IonBadge>
            </div>

            <div className="telemetry-card-content">
              {loading ? (
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <IonSpinner name="crescent" color="primary" />
                </div>
              ) : (
                <div>
                  <div className="telemetry-display-box">
                    <div>NIVEL BATERIA: {batteryPercent !== null ? `${batteryPercent}%` : 'N/D'}</div>
                    <div>ESTADO DE CARGA: {battery?.isCharging ? 'CONECTADO AL CARGADOR' : 'BATERIA PRINCIPAL'}</div>
                  </div>

                  <div className="telemetry-row">
                    <span className="telemetry-label">Porcentaje de Bateria</span>
                    <span className="telemetry-val">{batteryPercent !== null ? `${batteryPercent}%` : 'N/D'}</span>
                  </div>
                  <div className="telemetry-row">
                    <span className="telemetry-label">Estado de Carga</span>
                    <span className="telemetry-val">{battery?.isCharging ? 'Cargando' : 'No cargando'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Ficha Tecnica de Hardware */}
          <div className="telemetry-card">
            <div className="telemetry-card-header">
              <h2 className="telemetry-card-title">
                <IonIcon icon={hardwareChipOutline} />
                Ficha Tecnica del Dispositivo
              </h2>
              <IonBadge color="secondary">
                {info?.platform?.toUpperCase() || 'SISTEMA'}
              </IonBadge>
            </div>

            <div className="telemetry-card-content">
              {loading ? (
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <IonSpinner name="crescent" color="primary" />
                </div>
              ) : (
                <div>
                  <div className="telemetry-row">
                    <span className="telemetry-label">Modelo</span>
                    <span className="telemetry-val">{info?.model || 'Desconocido'}</span>
                  </div>
                  <div className="telemetry-row">
                    <span className="telemetry-label">Fabricante</span>
                    <span className="telemetry-val">{info?.manufacturer || 'Generico'}</span>
                  </div>
                  <div className="telemetry-row">
                    <span className="telemetry-label">Plataforma</span>
                    <span className="telemetry-val">{info?.platform || 'web'}</span>
                  </div>
                  <div className="telemetry-row">
                    <span className="telemetry-label">Sistema Operativo</span>
                    <span className="telemetry-val">{info?.operatingSystem || 'N/A'}</span>
                  </div>
                  <div className="telemetry-row">
                    <span className="telemetry-label">Version de OS</span>
                    <span className="telemetry-val">{info?.osVersion || 'N/A'}</span>
                  </div>
                  <div className="telemetry-row">
                    <span className="telemetry-label">Es Dispositivo Virtual</span>
                    <span className="telemetry-val">{info?.isVirtual ? 'Si (Emulador)' : 'No (Fisico)'}</span>
                  </div>
                  <div className="telemetry-row">
                    <span className="telemetry-label">Memoria Utilizada</span>
                    <span className="telemetry-val">
                      {info?.memUsed ? `${(info.memUsed / (1024 * 1024)).toFixed(0)} MB` : 'N/D'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Identificador Unico */}
          <div className="telemetry-card">
            <div className="telemetry-card-header">
              <h2 className="telemetry-card-title">
                <IonIcon icon={fingerPrintOutline} />
                Identificador de Dispositivo (UUID)
              </h2>
            </div>
            <div className="telemetry-card-content">
              <div className="telemetry-display-box" style={{ fontSize: '0.80rem' }}>
                <div style={{ color: '#94a3b8', marginBottom: '4px' }}>DEVICE ID:</div>
                <div>{deviceId || 'Generando UUID...'}</div>
              </div>

              <IonButton
                expand="block"
                className="btn-sensor-action"
                onClick={() => refresh()}
              >
                <IonIcon slot="start" icon={refreshOutline} />
                Refrescar Datos del Dispositivo
              </IonButton>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default DevicePage;
