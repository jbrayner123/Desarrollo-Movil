// parcial-02/src/components/ProgressBar.tsx
import React from 'react';
import { AnimatedCounter } from './AnimatedCounter';

interface ProgressBarProps {
  completedCount: number;
  totalMissions: number;
  progressPercent: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  completedCount,
  totalMissions,
  progressPercent
}) => {
  return (
    <div className="progress-container-meetgen">
      <div className="progress-header-row">
        <span className="progress-label-title">Progreso General</span>
        <div className="progress-number-mono">
          <AnimatedCounter value={progressPercent} />%
          <span style={{ fontSize: '0.74rem', color: '#8E8B82', marginLeft: '6px' }}>
            ({completedCount}/{totalMissions})
          </span>
        </div>
      </div>
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${Math.min(progressPercent, 100)}%` }}
        />
      </div>
    </div>
  );
};
