// src/hooks/usePushNotifications.ts
import { useState, useEffect, useCallback } from 'react';
import {
  PushNotifications,
  Token,
  PushNotificationSchema,
  ActionPerformed
} from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

/**
 * Custom Hook para gestionar Notificaciones Push (@capacitor/push-notifications).
 * Incluye manejo seguro de errores si falta google-services.json en Android durante pruebas locales.
 */
export function usePushNotifications() {
  const [token, setToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<PushNotificationSchema | null>(null);
  const [lastAction, setLastAction] = useState<ActionPerformed | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);

  /**
   * Solicita permisos y registra el dispositivo para Push
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    setError(null);
    if (!Capacitor.isNativePlatform()) {
      const msg = 'Push Notifications requiere ejecucion en dispositivo fisico o emulador nativo.';
      setError(msg);
      return false;
    }

    try {
      const permStatus = await PushNotifications.requestPermissions();
      if (permStatus.receive === 'granted') {
        await PushNotifications.register();
        setIsRegistered(true);
        return true;
      } else {
        setError('Permiso de notificaciones push denegado por el usuario.');
        return false;
      }
    } catch (err: any) {
      const msg = err?.message || 'Error al registrar notificaciones push (verifica google-services.json en Android).';
      setError(msg);
      return false;
    }
  }, []);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let regHandle: any;
    let errHandle: any;
    let notifHandle: any;
    let actionHandle: any;

    try {
      PushNotifications.addListener('registration', (tokenData: Token) => {
        setToken(tokenData.value);
        setError(null);
      }).then((h) => {
        regHandle = h;
      });

      PushNotifications.addListener('registrationError', (err) => {
        console.warn('Error en registro Push:', err.error);
        setError('Aviso Push: ' + (err.error || 'Falta archivo de servicios Firebase.'));
      }).then((h) => {
        errHandle = h;
      });

      PushNotifications.addListener(
        'pushNotificationReceived',
        (notif: PushNotificationSchema) => {
          setNotification(notif);
        }
      ).then((h) => {
        notifHandle = h;
      });

      PushNotifications.addListener(
        'pushNotificationActionPerformed',
        (action: ActionPerformed) => {
          setLastAction(action);
        }
      ).then((h) => {
        actionHandle = h;
      });
    } catch (e: any) {
      console.warn('No se pudieron adjuntar listeners de Push:', e);
    }

    return () => {
      if (regHandle) regHandle.remove();
      if (errHandle) errHandle.remove();
      if (notifHandle) notifHandle.remove();
      if (actionHandle) actionHandle.remove();
    };
  }, []);

  return {
    token,
    notification,
    lastAction,
    error,
    isRegistered,
    requestPermission
  };
}
