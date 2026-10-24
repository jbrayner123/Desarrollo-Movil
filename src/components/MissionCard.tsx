// parcial-02/src/components/MissionCard.tsx
import React from 'react';
import type { MissionDefinition } from '../types';
import { IonIcon } from '@ionic/react';
import { chevronForwardOutline, lockClosedOutline, checkmarkOutline } from 'ionicons/icons';

interface MissionCardProps {
  mission: MissionDefinition;
  onClick: () => void;
  index: number;
}

export const MissionCard: React.FC<MissionCardProps> = ({ mission, onClick, index }) => {
  const isCompleted = mission.status === 'completada';
  const isLocked = mission.status === 'bloqueada';

  return (
    <div
      id={`mission-card-${mission.id}`}
      className={`mission-card stagger-item ${isCompleted ? 'completed-card' : ''} ${isLocked ? 'locked-card' : ''}`}
      onClick={isLocked ? undefined : onClick}
      style={{
        cursor: isLocked ? 'not-allowed' : 'pointer',
        animationDelay: `${index * 0.08}s`
      }}
    >
      {/* Bloque lateral izquierdo naranja */}
      <div className="mission-card-accent">
        {isLocked ? (
          <IonIcon icon={lockClosedOutline} style={{ fontSize: '20px', color: '#ffffff' }} />
        ) : isCompleted ? (
          <IonIcon icon={checkmarkOutline} style={{ fontSize: '22px', color: '#ffffff' }} />
        ) : (
          <>
            <span className="mission-card-points">+{mission.points}</span>
            <span className="mission-card-points-label">PTS</span>
          </>
        )}
      </div>

      {/* Cuerpo principal */}
      <div className="mission-card-body">
        <div className="mission-card-top">
          <h3 className="mission-card-title">{mission.title}</h3>
          <span className={`status-pill ${mission.status}`}>
            {mission.status}
          </span>
        </div>

        <p className="mission-card-desc">{mission.description}</p>

        <div className="mission-card-meta">
          <span style={{ fontSize: '0.72rem', color: '#8E8B82', letterSpacing: '0.02em', fontWeight: 600 }}>
            {mission.sensor}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Si es Mision 1 y tiene evidencia fotografica, mostrar miniatura */}
            {mission.id === 1 && mission.evidence && (
              <img
                src={mission.evidence}
                alt="Evidencia"
                className="mission-thumbnail-preview"
              />
            )}
            {!isLocked && (
              <IonIcon
                icon={chevronForwardOutline}
                style={{ fontSize: '18px', color: '#8E8B82' }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
