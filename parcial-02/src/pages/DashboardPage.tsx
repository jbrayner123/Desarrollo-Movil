// parcial-02/src/pages/DashboardPage.tsx
import React, { useState } from 'react';
import { IonPage, IonContent, IonIcon } from '@ionic/react';
import { logOutOutline, flameOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { useAuth } from '../context/AuthContext';
import { useMissions } from '../hooks/useMissions';
import { ProgressBar } from '../components/ProgressBar';
import { MissionCard } from '../components/MissionCard';
import { MissionModal } from '../components/MissionModal';
import { ResultsRankingPage } from './ResultsRankingPage';
import { AnimatedCounter } from '../components/AnimatedCounter';
import type { MissionDefinition } from '../types';

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const {
    missions,
    points,
    completedCount,
    totalMissions,
    progressPercent,
    completeMission,
    recentlyUnlockedMissionId
  } = useMissions(user);

  const [activeTab, setActiveTab] = useState<'misiones' | 'resultados' | 'ranking'>('misiones');
  const [selectedMission, setSelectedMission] = useState<MissionDefinition | null>(null);

  const handleOpenMission = (m: MissionDefinition) => {
    setSelectedMission(m);
  };

  const handleCloseMission = () => {
    setSelectedMission(null);
  };

  return (
    <IonPage>
      <IonContent fullscreen style={{ '--background': 'var(--color-charcoal-dark)' } as React.CSSProperties}>
        {/* Header Superior Oscuro (#1C1C1E) Estilo Meetgen Vistas 2 y 3 */}
        <div className="dashboard-header-dark">
          <div className="dashboard-top-row">
            <div>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#8E8B82', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Sistema Operativo
              </span>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '2px 0 0 0', letterSpacing: '-0.03em', color: '#ffffff' }}>
                Hola, {user?.displayName || 'Agente'}!
              </h1>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Badge de Puntos Totales con Animacion Count-up */}
              <div className="points-badge-top">
                <IonIcon icon={flameOutline} />
                <AnimatedCounter value={points} /> PTS
              </div>

              {/* Boton Salir */}
              <button
                type="button"
                onClick={logout}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  cursor: 'pointer'
                }}
                title="Cerrar Sesion"
              >
                <IonIcon icon={logOutOutline} style={{ fontSize: '18px' }} />
              </button>
            </div>
          </div>

          <p style={{ fontSize: '0.82rem', color: '#8E8B82', margin: '0 0 16px 0' }}>
            Ejecuta las misiones de hardware para desbloquear el ranking.
          </p>

          {/* Selector de Pestañas Estilo Píldora Meetgen */}
          <div className="meetgen-tabs-pill">
            <button
              id="tab-misiones"
              type="button"
              className={`meetgen-tab-btn ${activeTab === 'misiones' ? 'active' : ''}`}
              onClick={() => setActiveTab('misiones')}
            >
              Misiones
            </button>
            <button
              id="tab-resultados"
              type="button"
              className={`meetgen-tab-btn ${activeTab === 'resultados' ? 'active' : ''}`}
              onClick={() => setActiveTab('resultados')}
            >
              Resultados
            </button>
            <button
              id="tab-ranking"
              type="button"
              className={`meetgen-tab-btn ${activeTab === 'ranking' ? 'active' : ''}`}
              onClick={() => setActiveTab('ranking')}
            >
              Ranking
            </button>
          </div>
        </div>

        {/* Contenido segun pestaña activa */}
        {activeTab === 'misiones' ? (
          <div className="dashboard-body-cream">
            {/* Barra de Progreso Integrada */}
            <ProgressBar
              completedCount={completedCount}
              totalMissions={totalMissions}
              progressPercent={progressPercent}
            />

            {/* Notificacion animada de mision desbloqueada */}
            {recentlyUnlockedMissionId === 3 && (
              <div
                className="stagger-item"
                style={{
                  background: 'var(--color-charcoal-dark)',
                  color: '#ffffff',
                  padding: '12px 16px',
                  borderRadius: '14px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <IonIcon icon={checkmarkCircleOutline} style={{ color: 'var(--color-terracotta)', fontSize: '22px' }} />
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 800 }}>Mision 3 Desbloqueada!</h4>
                  <p style={{ margin: 0, fontSize: '0.74rem', color: '#8E8B82' }}>
                    Has completado el desplazamiento y ahora puedes iniciar la prueba de quietud.
                  </p>
                </div>
              </div>
            )}

            {/* Listado de Tarjetas de Misiones */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6A675F', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Misiones de Campo ({missions.length})
              </span>
              <span style={{ fontSize: '0.72rem', color: '#8E8B82', fontWeight: 600 }}>
                {completedCount === totalMissions ? 'Todas completadas' : `${totalMissions - completedCount} pendientes`}
              </span>
            </div>

            {missions.map((mission, idx) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                index={idx}
                onClick={() => handleOpenMission(mission)}
              />
            ))}
          </div>
        ) : (
          <ResultsRankingPage />
        )}

        {/* Modal de Detalle / Ejecucion de Mision */}
        <MissionModal
          mission={selectedMission}
          isOpen={!!selectedMission}
          onClose={handleCloseMission}
          onComplete={(id, evidence) => {
            completeMission(id, evidence);
          }}
        />
      </IonContent>
    </IonPage>
  );
};
