// src/pages/CameraPage.tsx
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
  cameraOutline,
  trashOutline,
  imageOutline,
  alertCircleOutline
} from 'ionicons/icons';
import { useCamera } from '../hooks/useCamera';

const CameraPage: React.FC = () => {
  const { photo, loading, error, takePhoto, clearPhoto } = useCamera();

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Camara & Galeria</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        <div className="sensor-grid-container">
          <div className="telemetry-card">
            <div className="telemetry-card-header">
              <h2 className="telemetry-card-title">
                <IonIcon icon={cameraOutline} />
                Captura Fotografica
              </h2>
              <IonBadge color={photo ? 'success' : 'medium'}>
                {photo ? 'IMAGEN CARGADA' : 'SIN CAPTURA'}
              </IonBadge>
            </div>

            <div className="telemetry-card-content">
              {error && (
                <div style={{ padding: '10px 12px', background: '#fef2f2', border: '1px solid #f87171', borderRadius: '6px', color: '#991b1b', fontSize: '0.82rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IonIcon icon={alertCircleOutline} style={{ fontSize: '1.2rem', flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              {/* Visor de Imagen */}
              <div
                style={{
                  width: '100%',
                  minHeight: '260px',
                  backgroundColor: '#0f172a',
                  borderRadius: '8px',
                  border: '1px solid #1e293b',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  marginBottom: '14px'
                }}
              >
                {loading ? (
                  <div style={{ textAlign: 'center', color: '#38bdf8' }}>
                    <IonSpinner name="crescent" color="primary" />
                    <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem' }}>Procesando camara...</p>
                  </div>
                ) : photo ? (
                  <img
                    src={photo}
                    alt="Foto capturada"
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: '380px',
                      objectFit: 'contain',
                      display: 'block'
                    }}
                  />
                ) : (
                  <div style={{ textAlign: 'center', color: '#64748b', padding: '24px' }}>
                    <IonIcon icon={imageOutline} style={{ fontSize: '3rem', marginBottom: '8px', opacity: 0.6 }} />
                    <p style={{ margin: 0, fontSize: '0.88rem' }}>
                      Ninguna foto capturada aun. Presiona el boton inferior para abrir la camara o galeria.
                    </p>
                  </div>
                )}
              </div>

              {photo && (
                <div>
                  <div className="telemetry-display-box" style={{ fontSize: '0.78rem' }}>
                    <div style={{ color: '#94a3b8', marginBottom: '4px' }}>RUTA URI:</div>
                    <div>{photo}</div>
                  </div>

                  <IonButton
                    expand="block"
                    color="danger"
                    fill="outline"
                    className="btn-sensor-action"
                    onClick={() => clearPhoto()}
                  >
                    <IonIcon slot="start" icon={trashOutline} />
                    Descartar Fotografia
                  </IonButton>
                </div>
              )}
            </div>
          </div>

          <div className="telemetry-card">
            <div className="telemetry-card-content">
              <IonButton
                expand="block"
                className="btn-sensor-action"
                disabled={loading}
                onClick={() => takePhoto()}
              >
                <IonIcon slot="start" icon={cameraOutline} />
                Tomar Foto o Elegir de Galeria
              </IonButton>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default CameraPage;
