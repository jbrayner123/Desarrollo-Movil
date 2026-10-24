// parcial-02/src/hooks/useMissions.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import type { MissionDefinition, UserProgressData, AuthUser } from '../types';
import { syncProgressToFirebase, loadProgressFromFirebase } from '../firebase/config';
import { useLocalNotifications } from './useLocalNotifications';
import { useHaptics } from './useHaptics';

const INITIAL_MISSIONS: MissionDefinition[] = [
  {
    id: 1,
    title: 'Evidencia de Campo',
    tagline: 'Captura Fotografica',
    description: 'Toma una fotografia con la camara nativa del dispositivo para registrar evidencia visual de la operacion.',
    points: 40,
    sensor: '@capacitor/camera',
    requirement: 'Capturar y guardar 1 fotografia en vivo',
    status: 'pendiente'
  },
  {
    id: 2,
    title: 'Desplazamiento Tactico',
    tagline: 'Movimiento Real GPS',
    description: 'Desplazate al menos 30 o 50 metros desde tu punto de partida medidos con la formula de Haversine.',
    points: 50,
    sensor: '@capacitor/geolocation',
    requirement: 'Distancia recorrida >= 30m / 50m',
    status: 'pendiente'
  },
  {
    id: 3,
    title: 'Permanencia Activa',
    tagline: 'Quietud Acelerometro',
    description: 'Manten el dispositivo absolutamente quieto durante 10 segundos continuos medidos por el acelerometro.',
    points: 60,
    sensor: '@capacitor/motion + @capacitor/haptics',
    requirement: '10 segundos continuos de inmovilidad total',
    status: 'bloqueada' // Bloqueada hasta completar Mision 2
  }
];

export function useMissions(user: AuthUser | null) {
  const [missions, setMissions] = useState<MissionDefinition[]>(INITIAL_MISSIONS);
  const [points, setPoints] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [recentlyUnlockedMissionId, setRecentlyUnlockedMissionId] = useState<number | null>(null);

  const { notifyMissionCompleted, notifyOneMissionRemaining } = useLocalNotifications();
  const { vibrateSuccess, impactHeavy } = useHaptics();

  const userRef = useRef(user);
  userRef.current = user;

  // Carga inicial de progreso desde LocalStorage inmediato y luego Firestore
  const loadProgress = useCallback(async () => {
    if (!user) return;

    // 1. Lectura inmediata de LocalStorage para respuesta instantanea
    try {
      const raw = localStorage.getItem(`parcial02_progress_${user.uid}`);
      if (raw) {
        const savedData: UserProgressData = JSON.parse(raw);
        if (savedData && savedData.missions) {
          setMissions((prev) =>
            prev.map((m) => {
              const savedItem = savedData.missions.find((s) => s.id === m.id);
              if (savedItem?.completed) {
                return {
                  ...m,
                  status: 'completada',
                  evidence: savedItem.evidence,
                  completedAt: savedItem.completedAt
                };
              }
              if (m.id === 3) {
                const m2Saved = savedData.missions.find((s) => s.id === 2);
                if (m2Saved?.completed) {
                  return { ...m, status: 'pendiente' };
                }
                return { ...m, status: 'bloqueada' };
              }
              return m;
            })
          );
          setPoints(savedData.points || 0);
        }
      }
    } catch (e) {
      console.warn('Error en carga local inmediata:', e);
    }

    // 2. Sincronizacion en segundo plano con Firestore
    setIsSyncing(true);
    try {
      const remoteData = await loadProgressFromFirebase(user.uid);
      if (remoteData && remoteData.missions) {
        setMissions((prev) =>
          prev.map((m) => {
            const savedItem = remoteData.missions.find((s) => s.id === m.id);
            if (savedItem?.completed) {
              return {
                ...m,
                status: 'completada',
                evidence: savedItem.evidence,
                completedAt: savedItem.completedAt
              };
            }
            if (m.id === 3) {
              const m2Saved = remoteData.missions.find((s) => s.id === 2);
              if (m2Saved?.completed) {
                return { ...m, status: 'pendiente' };
              }
              return { ...m, status: 'bloqueada' };
            }
            return m;
          })
        );
        setPoints(remoteData.points || 0);
      }
    } catch (err) {
      console.warn('Error al sincronizar con Firestore:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [user]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  // Guardar progreso dualmente y despachar notificaciones
  const completeMission = useCallback(
    async (missionId: number, evidenceUrl?: string) => {
      let newlyCompletedCount = 0;
      let newTotalPoints = 0;
      let unlockedMission3 = false;

      setMissions((prev) => {
        const updated = prev.map((m) => {
          if (m.id === missionId && m.status !== 'completada') {
            return {
              ...m,
              status: 'completada' as const,
              evidence: evidenceUrl || m.evidence,
              completedAt: new Date().toISOString()
            };
          }
          return m;
        });

        // Verificar desbloqueo de Mision 3
        const m2 = updated.find((x) => x.id === 2);
        const m3 = updated.find((x) => x.id === 3);
        if (m2?.status === 'completada' && m3 && m3.status === 'bloqueada') {
          m3.status = 'pendiente';
          unlockedMission3 = true;
        }

        // Calcular puntos y cantidad completada
        newTotalPoints = updated
          .filter((x) => x.status === 'completada')
          .reduce((acc, curr) => acc + curr.points, 0);

        newlyCompletedCount = updated.filter((x) => x.status === 'completada').length;
        return updated;
      });

      setPoints(newTotalPoints);
      if (unlockedMission3) {
        setRecentlyUnlockedMissionId(3);
        setTimeout(() => setRecentlyUnlockedMissionId(null), 3000);
      }

      // 1. Retroalimentacion haptica
      impactHeavy();
      vibrateSuccess(400);

      // 2. Disparar Notificaciones Requeridas
      await notifyMissionCompleted();
      if (newlyCompletedCount === 2) {
        await notifyOneMissionRemaining();
      }

      // 3. Persistencia Dual
      const u = userRef.current;
      if (u) {
        const payload: UserProgressData = {
          points: newTotalPoints,
          missions: [
            { id: 1, completed: missionId === 1 || missions.find((x) => x.id === 1)?.status === 'completada', evidence: missionId === 1 ? evidenceUrl : missions.find((x) => x.id === 1)?.evidence },
            { id: 2, completed: missionId === 2 || missions.find((x) => x.id === 2)?.status === 'completada' },
            { id: 3, completed: missionId === 3 || missions.find((x) => x.id === 3)?.status === 'completada' }
          ]
        };

        try {
          localStorage.setItem(`parcial02_progress_${u.uid}`, JSON.stringify(payload));
          await syncProgressToFirebase(u.uid, u.displayName, u.email, payload);
        } catch (err) {
          console.warn('Error en persistencia dual:', err);
        }
      }
    },
    [missions, impactHeavy, vibrateSuccess, notifyMissionCompleted, notifyOneMissionRemaining]
  );

  const resetProgress = useCallback(async () => {
    setMissions(INITIAL_MISSIONS);
    setPoints(0);
    const u = userRef.current;
    if (u) {
      const emptyPayload: UserProgressData = {
        points: 0,
        missions: [
          { id: 1, completed: false },
          { id: 2, completed: false },
          { id: 3, completed: false }
        ]
      };
      localStorage.setItem(`parcial02_progress_${u.uid}`, JSON.stringify(emptyPayload));
      await syncProgressToFirebase(u.uid, u.displayName, u.email, emptyPayload);
    }
  }, []);

  const completedCount = missions.filter((m) => m.status === 'completada').length;
  const progressPercent = Math.round((completedCount / missions.length) * 100);

  return {
    missions,
    points,
    completedCount,
    totalMissions: missions.length,
    progressPercent,
    isSyncing,
    recentlyUnlockedMissionId,
    completeMission,
    resetProgress,
    reloadProgress: loadProgress
  };
}
