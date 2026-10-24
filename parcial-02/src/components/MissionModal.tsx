// parcial-02/src/components/MissionModal.tsx
import React, { useState } from 'react';
import type { MissionDefinition } from '../types';
import { IonModal, IonIcon } from '@ionic/react';
import { arrowBackOutline, cameraOutline, checkmarkCircleOutline, timeOutline, alertCircleOutline } from 'ionicons/icons';
import { useCamera } from '../hooks/useCamera';
import { useGeolocation } from '../hooks/useGeolocation';
import { useAccelerometer } from '../hooks/useAccelerometer';
import { RadarView } from './RadarView';
import { StillnessRing } from './StillnessRing';

interface MissionModalProps {
  mission: MissionDefinition | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (missionId: number, evidenceUrl?: string) => void;
}

export const MissionModal: React.FC<MissionModalProps> = ({
  mission,
  isOpen,
  onClose,
  onComplete
}) => {
  const [targetMeters, setTargetMeters] = useState<number>(30);

  // Hooks de sensores para cada mision
  const { photoUri, isCapturing, takePhoto, clearPhoto } = useCamera();
  const geo = useGeolocation(targetMeters);
  const accel = useAccelerometer();

  if (!mission) return null;

  const isCompleted = mission.status === 'completada';

  const handleFinishMission1 = () => {
    if (photoUri) {
      onComplete(1, photoUri);
      onClose();
    }
  };

  const handleFinishMission2 = () => {
    geo.stopTracking();
    onComplete(2);
    onClose();
  };

  const handleFinishMission3 = () => {
    accel.stopDetection();
    onComplete(3);
    onClose();
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} style={{ '--background': 'transparent' } as React.CSSProperties}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          background: 'var(--color-cream-base)',
          color: 'var(--color-charcoal-dark)'
        }}
      >
        {/* Cabecera en tono piedra (#D6D2C4) estilo Meetgen */}
        <div
          style={{
            background: 'var(--color-stone)',
            paddingTop: 'var(--safe-area-top-custom)',
            paddingLeft: '20px',
            paddingRight: '20px',
            paddingBottom: '20px',
            borderBottom: '1px solid rgba(28, 28, 30, 0.08)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <button
              id="btn-close-modal"
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(28, 28, 30, 0.08)',
                border: 'none',
                borderRadius: '50%',
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--color-charcoal-dark)'
              }}
            >
              <IonIcon icon={arrowBackOutline} style={{ fontSize: '20px' }} />
            </button>

            <span
              className="font-mono"
              style={{
                background: 'var(--color-terracotta)',
                color: '#ffffff',
                padding: '4px 10px',
                borderRadius: '100px',
                fontSize: '0.82rem',
                fontWeight: 800
              }}
            >
              +{mission.points} PTS
            </span>
          </div>

          <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#6A675F', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {mission.tagline}
          </span>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '4px 0 0 0', letterSpacing: '-0.02em', color: 'var(--color-charcoal-dark)' }}>
            {mission.title}
          </h2>
        </div>

        {/* Hoja Inferior Crema (#F4F1EA) con Requisitos y Sensor */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            background: 'var(--color-cream-surface)',
            paddingTop: '20px',
            paddingLeft: '20px',
            paddingRight: '20px',
            paddingBottom: 'var(--safe-area-bottom-custom)',
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
            marginTop: '-12px'
          }}
        >
          {/* Tarjeta de Requisitos */}
          <div
            style={{
              background: 'var(--color-cream-base)',
              borderRadius: '14px',
              padding: '14px 16px',
              marginBottom: '20px',
              border: '1px solid rgba(28, 28, 30, 0.06)'
            }}
          >
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Requisito de Cumplimiento
            </span>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', fontWeight: 600, color: 'var(--color-charcoal-dark)' }}>
              {mission.requirement}
            </p>
          </div>

          {isCompleted ? (
            <div style={{ textAlign: 'center', padding: '32px 16px' }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'var(--color-charcoal-dark)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px auto'
                }}
              >
                <IonIcon icon={checkmarkCircleOutline} style={{ fontSize: '32px' }} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 6px 0' }}>Mision Completada</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
                Ya has acumulado los +{mission.points} puntos de esta operacion.
              </p>
              {mission.evidence && (
                <div style={{ marginTop: 20 }}>
                  <img
                    src={mission.evidence}
                    alt="Evidencia"
                    style={{ maxWidth: '240px', borderRadius: '14px', border: '2px solid var(--color-stone)' }}
                  />
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Contenido especifico por mision */}
              {mission.id === 1 && (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  {photoUri || mission.evidence ? (
                    <div>
                      <img
                        src={photoUri || mission.evidence}
                        alt="Evidencia Capturada"
                        style={{
                          width: '100%',
                          maxHeight: '260px',
                          objectFit: 'cover',
                          borderRadius: '16px',
                          border: '2px solid var(--color-terracotta)',
                          marginBottom: '16px'
                        }}
                      />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          className="btn-meetgen-secondary"
                          onClick={clearPhoto}
                          style={{ flex: 1 }}
                        >
                          Tomar Otra
                        </button>
                        <button
                          type="button"
                          className="btn-meetgen-primary"
                          onClick={handleFinishMission1}
                          style={{ flex: 1.5 }}
                        >
                          Guardar Evidencia (+40 PTS)
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div
                        style={{
                          width: 80,
                          height: 80,
                          borderRadius: '50%',
                          background: 'var(--color-stone)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '20px auto',
                          color: 'var(--color-charcoal-dark)'
                        }}
                      >
                        <IonIcon icon={cameraOutline} style={{ fontSize: '36px' }} />
                      </div>
                      <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', marginBottom: 24 }}>
                        Presiona el boton para abrir la camara nativa y tomar la fotografia de prueba.
                      </p>
                      <button
                        type="button"
                        className="btn-meetgen-primary"
                        onClick={takePhoto}
                        disabled={isCapturing}
                      >
                        <IonIcon icon={cameraOutline} />
                        {isCapturing ? 'Abriendo Camara...' : 'Capturar Fotografia'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {mission.id === 2 && (
                <RadarView
                  currentLat={geo.currentLat}
                  currentLng={geo.currentLng}
                  distanceMeters={geo.distanceMeters}
                  targetMeters={geo.targetMeters}
                  isTracking={geo.isTracking}
                  isGoalReached={geo.isGoalReached}
                  onSetTarget={(m) => {
                    setTargetMeters(m);
                    geo.setTargetMeters(m);
                  }}
                  onStartTracking={geo.startTracking}
                  onStopTracking={geo.stopTracking}
                  onSimulateStep={geo.simulateStep}
                  onComplete={handleFinishMission2}
                />
              )}

              {mission.id === 3 && (
                <StillnessRing
                  elapsedSeconds={accel.elapsedSeconds}
                  targetSeconds={accel.targetSeconds}
                  isStill={accel.isStill}
                  isListening={accel.isListening}
                  isComplete={accel.isComplete}
                  isShaking={accel.isShaking}
                  accelX={accel.accelX}
                  accelY={accel.accelY}
                  accelZ={accel.accelZ}
                  motionMagnitude={accel.motionMagnitude}
                  onStartDetection={accel.startDetection}
                  onStopDetection={accel.stopDetection}
                  onSimulateSuccess={accel.simulateStillnessSuccess}
                  onComplete={handleFinishMission3}
                />
              )}
            </>
          )}
        </div>
      </div>
    </IonModal>
  );
};
