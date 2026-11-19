import { useCallback } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

/**
 * Respuesta haptica con @capacitor/haptics.
 * Los errores se ignoran: si el dispositivo no tiene motor de vibracion
 * (o el navegador no soporta navigator.vibrate) la app sigue funcionando.
 */
export function useHaptics() {
  /** Vibracion corta al iniciar el seguimiento. */
  const vibrarInicio = useCallback(async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
      await Haptics.vibrate({ duration: 150 });
    } catch {
      /* sin soporte de vibracion */
    }
  }, []);

  /** Vibracion algo mas larga al detener el seguimiento, para diferenciarla. */
  const vibrarFin = useCallback(async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
      await Haptics.vibrate({ duration: 300 });
    } catch {
      /* sin soporte de vibracion */
    }
  }, []);

  return { vibrarInicio, vibrarFin };
}
