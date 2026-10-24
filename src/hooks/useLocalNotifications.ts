// src/hooks/useLocalNotifications.ts
import { useState, useEffect, useCallback } from 'react';
import {
  LocalNotifications,
  PermissionStatus,
  ActionPerformed
} from '@capacitor/local-notifications';

export interface NotificationPayload {
  id?: number;
  title: string;
  body: string;
  seconds?: number;
}

/**
 * Custom Hook para gestionar notificaciones locales (@capacitor/local-notifications).
 * Soporta envio inmediato y programado.
 */
export function useLocalNotifications() {
  const [permission, setPermission] = useState<PermissionStatus | null>(null);
  const [lastAction, setLastAction] = useState<ActionPerformed | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Consulta el estado actual de permisos
   */
  const checkPermission = useCallback(async (): Promise<PermissionStatus | null> => {
    try {
      const status = await LocalNotifications.checkPermissions();
      setPermission(status);
      return status;
    } catch (err: any) {
      setError(err?.message || 'Error al verificar permisos de notificaciones.');
      return null;
    }
  }, []);

  /**
   * Solicita permisos de notificacion al usuario
   */
  const requestPermission = useCallback(async (): Promise<PermissionStatus | null> => {
    try {
      const status = await LocalNotifications.requestPermissions();
      setPermission(status);
      return status;
    } catch (err: any) {
      setError(err?.message || 'Error al solicitar permisos de notificaciones.');
      return null;
    }
  }, []);

  /**
   * Envia una notificacion local inmediata
   */
  const sendNotification = useCallback(async ({
    id = Math.floor(Math.random() * 100000),
    title,
    body
  }: NotificationPayload): Promise<number> => {
    setError(null);
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id,
            title,
            body,
            schedule: { at: new Date(Date.now() + 200) }
          }
        ]
      });
      return id;
    } catch (err: any) {
      const msg = err?.message || 'Error al enviar notificacion inmediata.';
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  /**
   * Programa una notificacion en N segundos
   */
  const scheduleNotification = useCallback(async ({
    id = Math.floor(Math.random() * 100000),
    title,
    body,
    seconds = 5
  }: NotificationPayload): Promise<number> => {
    setError(null);
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id,
            title,
            body,
            schedule: { at: new Date(Date.now() + seconds * 1000) }
          }
        ]
      });
      return id;
    } catch (err: any) {
      const msg = err?.message || 'Error al programar notificacion.';
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  /**
   * Cancela una notificacion programada por ID
   */
  const cancelNotification = useCallback(async (id: number): Promise<void> => {
    setError(null);
    try {
      await LocalNotifications.cancel({
        notifications: [{ id }]
      });
    } catch (err: any) {
      setError(err?.message || 'Error al cancelar notificacion.');
    }
  }, []);

  // Suscribirse a interacciones de notificacion y verificar permisos iniciales
  useEffect(() => {
    checkPermission();

    const listenerPromise = LocalNotifications.addListener(
      'localNotificationActionPerformed',
      (action: ActionPerformed) => {
        setLastAction(action);
      }
    );

    return () => {
      listenerPromise.then((handle) => handle.remove()).catch(() => {});
    };
  }, [checkPermission]);

  return {
    permission,
    lastAction,
    error,
    checkPermission,
    requestPermission,
    sendNotification,
    scheduleNotification,
    cancelNotification
  };
}
