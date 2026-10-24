// parcial-02/src/components/RankingList.tsx
import React, { useEffect, useState } from 'react';
import type { LeaderboardUser } from '../types';
import { fetchTop5Ranking } from '../firebase/config';
import { IonIcon, IonSpinner } from '@ionic/react';
import { trophyOutline, personOutline, syncOutline } from 'ionicons/icons';

interface RankingListProps {
  currentUid: string;
  currentPoints: number;
  currentName: string;
  currentEmail: string;
}

export const RankingList: React.FC<RankingListProps> = ({
  currentUid,
  currentPoints,
  currentName,
  currentEmail
}) => {
  const getInitialList = (): LeaderboardUser[] => {
    const defaultList: LeaderboardUser[] = [
      { uid: 'seed-diego', displayName: 'Diego Valderrama', email: 'diego@univalle.edu.co', points: 130, completedCount: 3 },
      { uid: 'seed-carlos', displayName: 'Carlos Mendoza', email: 'carlos.m@meetgen.dev', points: 100, completedCount: 2 },
      { uid: 'seed-sofia', displayName: 'Sofia Herrera', email: 'sofia.h@meetgen.dev', points: 70, completedCount: 2 },
      { uid: 'seed-valeria', displayName: 'Valeria Rios', email: 'valeria.r@meetgen.dev', points: 30, completedCount: 1 },
      { uid: currentUid || 'me', displayName: currentName || 'Jose Minotta', email: currentEmail || '', points: currentPoints || 90, completedCount: 2, isCurrentUser: true }
    ];
    defaultList.sort((a, b) => b.points - a.points);
    return defaultList.slice(0, 5).map((u, i) => ({ ...u, rank: i + 1, isCurrentUser: u.uid === currentUid || u.uid === 'me' }));
  };

  const [top5, setTop5] = useState<LeaderboardUser[]>(getInitialList);
  const [loading, setLoading] = useState<boolean>(false);

  const loadRanking = async () => {
    try {
      const data = await fetchTop5Ranking(currentUid, currentPoints, currentName, currentEmail);
      if (data && data.length > 0) {
        setTop5(data);
      }
    } catch (err) {
      console.warn('Error al cargar ranking:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTop5(getInitialList());
    loadRanking();
  }, [currentUid, currentPoints]);

  return (
    <div style={{ background: '#141416', borderRadius: '20px', padding: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <IonIcon icon={trophyOutline} style={{ color: 'var(--color-terracotta)', fontSize: '20px' }} />
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Top 5 Competidores
          </h3>
        </div>
        <button
          type="button"
          onClick={loadRanking}
          style={{ background: 'transparent', border: 'none', color: '#8E8B82', cursor: 'pointer' }}
        >
          <IonIcon icon={syncOutline} style={{ fontSize: '18px' }} />
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <IonSpinner name="crescent" style={{ color: 'var(--color-terracotta)' }} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {top5.map((user, idx) => {
            const isMe = user.isCurrentUser || user.uid === currentUid;
            return (
              <div
                key={user.uid}
                className="stagger-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: isMe ? 'rgba(232, 106, 51, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                  border: isMe ? '1px solid var(--color-terracotta)' : '1px solid rgba(255, 255, 255, 0.06)',
                  animationDelay: `${idx * 0.06}s`
                }}
              >
                {/* Posicion del Ranking */}
                <div
                  className="font-mono"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '8px',
                    background: idx === 0 ? 'var(--color-terracotta)' : 'rgba(255,255,255,0.08)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                    fontWeight: 800
                  }}
                >
                  {user.rank || idx + 1}
                </div>

                {/* Info de Usuario */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user.displayName}
                    </span>
                    {isMe && (
                      <span
                        style={{
                          fontSize: '0.62rem',
                          fontWeight: 800,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: 'var(--color-terracotta)',
                          color: '#ffffff'
                        }}
                      >
                        TU
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#8E8B82' }}>
                    {user.completedCount} de 3 misiones
                  </span>
                </div>

                {/* Puntaje */}
                <div style={{ textAlign: 'right' }}>
                  <span className="font-mono" style={{ fontSize: '1.05rem', fontWeight: 800, color: isMe ? 'var(--color-terracotta)' : '#ffffff' }}>
                    {user.points}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: '#8E8B82', marginLeft: '3px' }}>PTS</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
