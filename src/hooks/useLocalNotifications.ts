import { useCallback, useEffect, useRef } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

/**
 * Notificaciones locales con @capacitor/local-notifications.
 * Se disparan mientras la app esta abierta o en segundo plano reciente
 * (mensajes nuevos, mascotas perdidas, paseos confirmados).
 */
export function useLocalNotifications() {
  const granted = useRef(false);
  const nextId = useRef(Math.floor(Date.now() % 100_000));

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    LocalNotifications.checkPermissions()
      .then((p) => (p.display === 'granted' ? p : LocalNotifications.requestPermissions()))
      .then((p) => {
        granted.current = p.display === 'granted';
      })
      .catch(() => undefined);
  }, []);

  /** Muestra una notificacion ahora o, con `inMinutes`, la programa para despues. */
  const notify = useCallback(async (title: string, body: string, inMinutes = 0) => {
    if (!Capacitor.isNativePlatform() || !granted.current) return;
    nextId.current += 1;
    await LocalNotifications.schedule({
      notifications: [
        {
          id: nextId.current,
          title,
          body,
          schedule: inMinutes > 0 ? { at: new Date(Date.now() + inMinutes * 60_000), allowWhileIdle: true } : undefined
        }
      ]
    }).catch(() => undefined);
  }, []);

  return { notify };
}
