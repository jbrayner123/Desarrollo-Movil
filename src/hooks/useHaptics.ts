import { useMemo } from 'react';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

/**
 * Respuesta tactil suave con @capacitor/haptics.
 * Devuelve siempre el mismo objeto, para usarlo como dependencia de efectos sin
 * provocar suscripciones repetidas. Si no hay vibracion, los errores se ignoran.
 */
export function useHaptics() {
  return useMemo(
    () => ({
      tap: () => Haptics.impact({ style: ImpactStyle.Light }).catch(() => undefined),
      press: () => Haptics.impact({ style: ImpactStyle.Medium }).catch(() => undefined),
      success: () => Haptics.notification({ type: NotificationType.Success }).catch(() => undefined),
      warning: () => Haptics.notification({ type: NotificationType.Warning }).catch(() => undefined)
    }),
    []
  );
}
