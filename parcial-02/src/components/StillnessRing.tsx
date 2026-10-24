// parcial-02/src/components/StillnessRing.tsx
import React from 'react';
import { IonIcon } from '@ionic/react';
import { playOutline, stopOutline, pulseOutline, checkmarkDoneOutline } from 'ionicons/icons';

interface StillnessRingProps {
  elapsedSeconds: number;
  targetSeconds: number;
  isStill: boolean;
  isListening: boolean;
  isComplete: boolean;
  isShaking: boolean;
  accelX: number;
  accelY: number;
  accelZ: number;
  motionMagnitude: number;
  onStartDetection: () => void;
  onStopDetection: () => void;
  onSimulateSuccess: () => void;
  onComplete: () => void;
}

export const StillnessRing: React.FC<StillnessRingProps> = ({
  elapsedSeconds,
  targetSeconds,
  isStill,
  isListening,
  isComplete,
  isShaking,
  accelX,
  accelY,
  accelZ,
  motionMagnitude,
  onStartDetection,
  onStopDetection,
  onSimulateSuccess,
  onComplete
}) => {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = Math.min(elapsedSeconds / targetSeconds, 1);
  const strokeDashoffset = circumference - progressRatio * circumference;

  return (
    <div style={{ textAlign: 'center', padding: '16px 0' }}>
      {/* Anillo Circular SVG con Shake animado si se mueve */}
      <div
        className={isShaking ? 'shake-active' : ''}
        style={{
          position: 'relative',
          width: 180,
          height: 180,
          margin: '0 auto 20px auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <svg width="180" height="180" style={{ transform: 'rotate(-90deg)' }}>
          {/* Pista de fondo */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="transparent"
            stroke="rgba(28, 28, 30, 0.12)"
            strokeWidth="8"
          />
          {/* Anillo de progreso animado */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="transparent"
            stroke={isStill ? 'var(--color-terracotta)' : '#C8C4B6'}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.1s linear, stroke 0.2s ease'
            }}
          />
        </svg>

        {/* Contador Central Monoespaciado */}
        <div
          style={{
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <span
            className="font-mono"
            style={{
              fontSize: '2.2rem',
              fontWeight: 800,
              color: isComplete ? 'var(--color-charcoal-dark)' : 'var(--color-charcoal-dark)',
              lineHeight: 1
            }}
          >
            {elapsedSeconds.toFixed(1)}
            <span style={{ fontSize: '0.85rem', color: '#8E8B82' }}>s</span>
          </span>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#8E8B82', marginTop: 4 }}>
            DE {targetSeconds}s QUIETO
          </span>
        </div>
      </div>

      {/* Estado del Acelerometro */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <span
            className="status-pill"
            style={{
              background: !isListening
                ? 'var(--color-pill-muted)'
                : isStill
                ? 'var(--color-charcoal-dark)'
                : '#D45A25',
              color: '#ffffff'
            }}
          >
            {!isListening ? 'SENSOR EN ESPERA' : isStill ? 'REPOSO ACTIVO' : 'MOVIMIENTO DETECTADO'}
          </span>
        </div>

        {/* Telemetria triaxial */}
        <div
          className="font-mono"
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            fontSize: '0.74rem',
            color: '#5A574F',
            background: 'var(--color-stone)',
            padding: '6px 12px',
            borderRadius: '10px',
            maxWidth: '300px',
            margin: '0 auto'
          }}
        >
          <span>X: {accelX.toFixed(1)}</span>
          <span>Y: {accelY.toFixed(1)}</span>
          <span>Z: {accelZ.toFixed(1)}</span>
          <span>Delta: {motionMagnitude.toFixed(2)}</span>
        </div>
      </div>

      {/* Controles */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '320px', margin: '0 auto' }}>
        {!isListening ? (
          <button
            type="button"
            className="btn-meetgen-primary"
            onClick={onStartDetection}
          >
            <IonIcon icon={playOutline} />
            Iniciar Prueba de Quietud
          </button>
        ) : (
          <button
            type="button"
            className="btn-meetgen-secondary"
            onClick={onStopDetection}
          >
            <IonIcon icon={stopOutline} />
            Detener Sensor
          </button>
        )}

        <button
          type="button"
          className="btn-meetgen-secondary"
          onClick={onSimulateSuccess}
          style={{ fontSize: '0.74rem', padding: '8px' }}
        >
          <IonIcon icon={pulseOutline} />
          Simular 10s Continuos (Demostracion)
        </button>

        {isComplete && (
          <button
            type="button"
            className="btn-meetgen-primary"
            onClick={onComplete}
            style={{ marginTop: '8px', background: 'var(--color-charcoal-dark)' }}
          >
            <IonIcon icon={checkmarkDoneOutline} />
            Reclamar +60 PTS (Vibracion)
          </button>
        )}
      </div>
    </div>
  );
};
