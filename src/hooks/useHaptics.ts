// src/hooks/useHaptics.ts
import { useState, useEffect, useCallback } from 'react';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export type HapticsImpactType = 'light' | 'medium' | 'heavy';
export type HapticsNotificationType = 'success' | 'warning' | 'error';

/**
 * Custom Hook para gestionar el motor háptico y vibración del dispositivo (@capacitor/haptics).
 */
export function useHaptics() {
  const [isAvailable, setIsAvailable] = useState<boolean>(true);

  /**
   * Verifica la disponibilidad de la API háptica
   */
  const checkAvailability = useCallback(async (): Promise<boolean> => {
    try {
      // Haptics en Capacitor esta soportado nativamente en iOS/Android
      // En Web puede usar la API navigator.vibrate
      const available = typeof navigator !== 'undefined' && 'vibrate' in navigator;
      setIsAvailable(available || true);
      return true;
    } catch {
      setIsAvailable(false);
      return false;
    }
  }, []);

  useEffect(() => {
    checkAvailability();
  }, [checkAvailability]);

  /**
   * Genera impacto haptico
   */
  const impact = useCallback(async (style: HapticsImpactType = 'medium'): Promise<void> => {
    try {
      let impactStyle: ImpactStyle;
      switch (style) {
        case 'light':
          impactStyle = ImpactStyle.Light;
          break;
        case 'heavy':
          impactStyle = ImpactStyle.Heavy;
          break;
        case 'medium':
        default:
          impactStyle = ImpactStyle.Medium;
          break;
      }
      await Haptics.impact({ style: impactStyle });
    } catch (e) {
      console.warn('Haptics impact no soportado en esta plataforma:', e);
    }
  }, []);

  /**
   * Genera una vibracion de notificacion segun el tipo
   */
  const notify = useCallback(async (type: HapticsNotificationType = 'success'): Promise<void> => {
    try {
      let notifType: NotificationType;
      switch (type) {
        case 'warning':
          notifType = NotificationType.Warning;
          break;
        case 'error':
          notifType = NotificationType.Error;
          break;
        case 'success':
        default:
          notifType = NotificationType.Success;
          break;
      }
      await Haptics.notification({ type: notifType });
    } catch (e) {
      console.warn('Haptics notification no soportado en esta plataforma:', e);
    }
  }, []);

  /**
   * Ejecuta vibracion por duracion en milisegundos
   */
  const vibrate = useCallback(async (duration: number = 100): Promise<void> => {
    try {
      await Haptics.vibrate({ duration });
    } catch (e) {
      console.warn('Haptics vibrate no soportado:', e);
    }
  }, []);

  /**
   * Eventos de seleccion háptica
   */
  const selectionStart = useCallback(async (): Promise<void> => {
    try {
      await Haptics.selectionStart();
    } catch (e) {
      console.warn('Haptics selectionStart:', e);
    }
  }, []);

  const selectionChanged = useCallback(async (): Promise<void> => {
    try {
      await Haptics.selectionChanged();
    } catch (e) {
      console.warn('Haptics selectionChanged:', e);
    }
  }, []);

  const selectionEnd = useCallback(async (): Promise<void> => {
    try {
      await Haptics.selectionEnd();
    } catch (e) {
      console.warn('Haptics selectionEnd:', e);
    }
  }, []);

  return {
    isAvailable,
    checkAvailability,
    impact,
    notify,
    vibrate,
    selectionStart,
    selectionChanged,
    selectionEnd
  };
}
