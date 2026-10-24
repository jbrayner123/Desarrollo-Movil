// parcial-02/src/hooks/useLocalNotifications.ts
import { useEffect, useState } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';

export function useLocalNotifications() {
  const [hasPermission, setHasPermission] = useState<boolean>(false);

  useEffect(() => {
    async function initNotifications() {
      try {
        const check = await LocalNotifications.checkPermissions();
        if (check.display === 'granted') {
          setHasPermission(true);
        } else {
          const req = await LocalNotifications.requestPermissions();
          setHasPermission(req.display === 'granted');
        }

        // Crear canal de notificaciones en Android
        await LocalNotifications.createChannel({
          id: 'misiones_channel',
          name: 'Notificaciones de Misiones',
          description: 'Alertas de progreso y cumplimiento de misiones',
          importance: 5,
          visibility: 1,
          vibration: true
        });
      } catch (err) {
        console.warn('LocalNotifications no soportado o denegado en este entorno:', err);
      }
    }
    initNotifications();
  }, []);

  const notifyMissionCompleted = async () => {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Math.floor(Math.random() * 100000),
            title: 'Sistema de Misiones',
            body: 'Has completado una mision',
            channelId: 'misiones_channel',
            schedule: { at: new Date(Date.now() + 200) }
          }
        ]
      });
    } catch (err) {
      console.warn('Error al enviar notificacion de mision completada:', err);
    }
  };

  const notifyOneMissionRemaining = async () => {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Math.floor(Math.random() * 100000),
            title: 'Progreso de Misiones',
            body: 'Te falta 1 mision para completar',
            channelId: 'misiones_channel',
            schedule: { at: new Date(Date.now() + 600) }
          }
        ]
      });
    } catch (err) {
      console.warn('Error al enviar notificacion de mision restante:', err);
    }
  };

  return {
    hasPermission,
    notifyMissionCompleted,
    notifyOneMissionRemaining
  };
}
