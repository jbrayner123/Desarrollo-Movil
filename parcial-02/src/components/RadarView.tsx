// parcial-02/src/components/RadarView.tsx
import React from 'react';
import { IonIcon } from '@ionic/react';
import { navigateOutline, locateOutline, playOutline, stopOutline } from 'ionicons/icons';

interface RadarViewProps {
  currentLat: number | null;
  currentLng: number | null;
  distanceMeters: number;
  targetMeters: number;
  isTracking: boolean;
  isGoalReached: boolean;
  onSetTarget: (meters: number) => void;
  onStartTracking: () => void;
  onStopTracking: () => void;
  onSimulateStep: (meters: number) => void;
  onComplete: () => void;
}

export const RadarView: React.FC<RadarViewProps> = ({
  currentLat,
  currentLng,
  distanceMeters,
  targetMeters,
  isTracking,
  isGoalReached,
  onSetTarget,
  onStartTracking,
  onStopTracking,
  onSimulateStep,
  onComplete
}) => {
  const percent = Math.min(Math.round((distanceMeters / targetMeters) * 100), 100);

  return (
    <div style={{ textAlign: 'center', padding: '16px 0' }}>
      {/* Radar Grafico */}
      <div
        style={{
          position: 'relative',
          width: 190,
          height: 190,
          margin: '0 auto 20px auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Anillos concentricos del radar */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            border: '1px solid rgba(232, 106, 51, 0.25)',
            background: 'rgba(232, 106, 51, 0.04)'
          }}
          className={isTracking ? 'radar-pulse-circle' : ''}
        />
        <div
          style={{
            position: 'absolute',
            width: '70%',
            height: '70%',
            borderRadius: '50%',
            border: '1px dashed rgba(232, 106, 51, 0.4)'
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: '40%',
            height: '40%',
            borderRadius: '50%',
            border: '1px solid rgba(232, 106, 51, 0.6)'
          }}
        />

        {/* Punto central del sensor GPS */}
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: isGoalReached ? '#1C1C1E' : 'var(--color-terracotta)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 14px rgba(232, 106, 51, 0.4)',
            zIndex: 2,
            transition: 'background-color 0.3s ease'
          }}
        >
          <IonIcon icon={navigateOutline} style={{ fontSize: '26px' }} />
        </div>
      </div>

      {/* Selector de Umbral (30m / 50m) */}
      <div style={{ display: 'inline-flex', gap: '8px', background: 'var(--color-stone)', padding: '4px', borderRadius: '100px', marginBottom: '16px' }}>
        <button
          type="button"
          onClick={() => onSetTarget(30)}
          style={{
            border: 'none',
            padding: '5px 14px',
            borderRadius: '100px',
            fontSize: '0.74rem',
            fontWeight: 700,
            cursor: 'pointer',
            background: targetMeters === 30 ? 'var(--color-terracotta)' : 'transparent',
            color: targetMeters === 30 ? '#ffffff' : 'var(--color-charcoal-dark)'
          }}
        >
          Meta: 30m
        </button>
        <button
          type="button"
          onClick={() => onSetTarget(50)}
          style={{
            border: 'none',
            padding: '5px 14px',
            borderRadius: '100px',
            fontSize: '0.74rem',
            fontWeight: 700,
            cursor: 'pointer',
            background: targetMeters === 50 ? 'var(--color-terracotta)' : 'transparent',
            color: targetMeters === 50 ? '#ffffff' : 'var(--color-charcoal-dark)'
          }}
        >
          Meta: 50m
        </button>
      </div>

      {/* Telemetria Numerica en Fuente Mono */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-charcoal-dark)', lineHeight: 1 }} className="font-mono">
          {distanceMeters.toFixed(1)}
          <span style={{ fontSize: '1rem', color: 'var(--color-text-muted)', marginLeft: '4px' }}>m</span>
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: '6px 0 0 0' }}>
          Distancia calculada mediante formula de Haversine ({percent}%)
        </p>

        {currentLat && currentLng && (
          <div style={{ marginTop: '8px', fontSize: '0.72rem', color: '#8E8B82' }} className="font-mono">
            Lat: {currentLat.toFixed(5)} | Lng: {currentLng.toFixed(5)}
          </div>
        )}
      </div>

      {/* Controles de Seguimiento */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '320px', margin: '0 auto' }}>
        {!isTracking ? (
          <button
            type="button"
            className="btn-meetgen-primary"
            onClick={onStartTracking}
          >
            <IonIcon icon={playOutline} />
            Iniciar Rastreo GPS
          </button>
        ) : (
          <button
            type="button"
            className="btn-meetgen-secondary"
            onClick={onStopTracking}
          >
            <IonIcon icon={stopOutline} />
            Pausar Rastreo
          </button>
        )}

        {/* Accion rapida para avanzar o simular en caso de prueba interna */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
          <button
            type="button"
            className="btn-meetgen-secondary"
            onClick={() => onSimulateStep(10)}
            style={{ fontSize: '0.74rem', padding: '8px' }}
          >
            <IonIcon icon={locateOutline} />
            +10m Prueba
          </button>
          <button
            type="button"
            className="btn-meetgen-secondary"
            onClick={() => onSimulateStep(targetMeters)}
            style={{ fontSize: '0.74rem', padding: '8px' }}
          >
            Completar Meta
          </button>
        </div>

        {isGoalReached && (
          <button
            type="button"
            className="btn-meetgen-primary"
            onClick={onComplete}
            style={{ marginTop: '8px', background: 'var(--color-charcoal-dark)' }}
          >
            Validar Mision (+50 PTS)
          </button>
        )}
      </div>
    </div>
  );
};
