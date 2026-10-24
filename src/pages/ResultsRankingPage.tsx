// parcial-02/src/pages/ResultsRankingPage.tsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useMissions } from '../hooks/useMissions';
import { RankingList } from '../components/RankingList';
import { IonIcon } from '@ionic/react';
import { trophyOutline, ribbonOutline, refreshOutline, checkmarkDoneCircleOutline } from 'ionicons/icons';

export const ResultsRankingPage: React.FC = () => {
  const { user } = useAuth();
  const { points, completedCount, totalMissions, progressPercent, resetProgress } = useMissions(user);

  const getRankTitle = () => {
    if (completedCount === 3) return 'Agente Elite Operativo';
    if (completedCount === 2) return 'Especialista de Campo';
    if (completedCount === 1) return 'Agente en Servicio';
    return 'Recluta en Entrenamiento';
  };

  return (
    <div style={{ background: 'var(--color-charcoal-dark)', minHeight: '100%', padding: '20px', paddingBottom: 'var(--safe-area-bottom-custom)', color: '#ffffff' }}>
      {/* Resumen Superior */}
      <div style={{ marginBottom: '24px' }}>
        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--color-terracotta)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Reporte de Rendimiento
        </span>
        <h2 style={{ fontSize: '1.65rem', fontWeight: 800, margin: '4px 0 6px 0', letterSpacing: '-0.03em' }}>
          Estado & Resultados
        </h2>
        <p style={{ fontSize: '0.84rem', color: '#8E8B82', margin: 0 }}>
          Evaluacion de telemetria de hardware, GPS y camara para el Parcial 2.
        </p>
      </div>

      {/* Tarjetas Metricas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
        <div style={{ background: '#141416', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-terracotta)', marginBottom: '8px' }}>
            <IonIcon icon={trophyOutline} style={{ fontSize: '18px' }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Puntaje Total</span>
          </div>
          <div className="font-mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff' }}>
            {points} <span style={{ fontSize: '0.8rem', color: '#8E8B82' }}>PTS</span>
          </div>
        </div>

        <div style={{ background: '#141416', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10B981', marginBottom: '8px' }}>
            <IonIcon icon={checkmarkDoneCircleOutline} style={{ fontSize: '18px' }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>Misiones</span>
          </div>
          <div className="font-mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff' }}>
            {completedCount}/{totalMissions}
            <span style={{ fontSize: '0.8rem', color: '#8E8B82', marginLeft: '6px' }}>({progressPercent}%)</span>
          </div>
        </div>
      </div>

      {/* Rango de Agente */}
      <div
        style={{
          background: '#141416',
          borderRadius: '16px',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          marginBottom: '24px',
          border: '1px solid rgba(255,255,255,0.06)'
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '12px',
            background: 'var(--color-terracotta)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff'
          }}
        >
          <IonIcon icon={ribbonOutline} style={{ fontSize: '24px' }} />
        </div>
        <div>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#8E8B82', textTransform: 'uppercase' }}>
            Rango Operativo
          </span>
          <h4 style={{ margin: '2px 0 0 0', fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>
            {getRankTitle()}
          </h4>
        </div>
      </div>

      {/* Componente Ranking Top 5 */}
      <RankingList
        currentUid={user?.uid || 'guest'}
        currentPoints={points}
        currentName={user?.displayName || 'Mi Usuario'}
        currentEmail={user?.email || ''}
      />

      {/* Boton de Reinicio para Demostracion */}
      <div style={{ textAlign: 'center', marginTop: '28px' }}>
        <button
          type="button"
          onClick={resetProgress}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#8E8B82',
            padding: '8px 16px',
            borderRadius: '100px',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <IonIcon icon={refreshOutline} />
          Reiniciar Progreso de Demostracion
        </button>
      </div>
    </div>
  );
};
