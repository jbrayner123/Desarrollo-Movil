import { useCallback, useEffect, useRef, useState } from 'react';
import { Device } from '@capacitor/device';
import { INTERVALO_BATERIA_MS, UMBRAL_BATERIA_PORCENTAJE } from '../config/constants';
import type { EstadoBateria } from '../types';

interface Opciones {
  /** Solo se consulta periodicamente mientras el tracking esta activo. */
  activo: boolean;
  /** Se invoca cuando la bateria cae por debajo del umbral sin estar cargando. */
  onBateriaBaja: (nivel: number) => void;
}

/** Convierte el valor 0-1 de Capacitor a porcentaje entero. */
const aPorcentaje = (nivel?: number): number | null =>
  typeof nivel === 'number' && nivel >= 0 ? Math.round(nivel * 100) : null;

/** Regla de negocio: bateria baja = por debajo del umbral y sin cargador conectado. */
export const esBateriaBaja = (b: EstadoBateria): boolean =>
  b.nivel !== null && b.nivel < UMBRAL_BATERIA_PORCENTAJE && !b.cargando;

/**
 * Monitoreo de bateria con @capacitor/device.
 * Device no expone eventos de bateria, por eso se consulta cada INTERVALO_BATERIA_MS
 * mientras `activo` sea true.
 */
export function useBatteryMonitor({ activo, onBateriaBaja }: Opciones) {
  const [bateria, setBateria] = useState<EstadoBateria>({ nivel: null, cargando: false });
  const callbackRef = useRef(onBateriaBaja);
  callbackRef.current = onBateriaBaja;

  const leerBateria = useCallback(async (): Promise<EstadoBateria> => {
    try {
      const info = await Device.getBatteryInfo();
      const estado = { nivel: aPorcentaje(info.batteryLevel), cargando: !!info.isCharging };
      setBateria(estado);
      return estado;
    } catch {
      return { nivel: null, cargando: false };
    }
  }, []);

  // Lectura inicial para mostrar el nivel en pantalla.
  useEffect(() => {
    leerBateria();
  }, [leerBateria]);

  // Sondeo periodico solo durante el tracking.
  useEffect(() => {
    if (!activo) return;

    const revisar = async () => {
      const estado = await leerBateria();
      if (esBateriaBaja(estado) && estado.nivel !== null) {
        callbackRef.current(estado.nivel);
      }
    };

    revisar();
    const id = window.setInterval(revisar, INTERVALO_BATERIA_MS);
    return () => window.clearInterval(id);
  }, [activo, leerBateria]);

  return { bateria, leerBateria };
}
