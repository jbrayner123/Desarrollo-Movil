// src/hooks/useGeolocation.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import { Geolocation, Position, CallbackID } from '@capacitor/geolocation';

/**
 * Custom Hook para gestionar el sensor de Geoposicionamiento (@capacitor/geolocation).
 * Permite lectura puntual y rastreo continuo de alta precision.
 */
export function useGeolocation() {
  const [position, setPosition] = useState<Position | null>(null);
  const [watchId, setWatchId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<string | null>(null);

  // Mantener referencia sincronizada
  useEffect(() => {
    watchIdRef.current = watchId;
  }, [watchId]);

  /**
   * Obtiene la ubicacion actual de forma puntual
   */
  const getCurrentLocation = useCallback(async (): Promise<Position | null> => {
    setError(null);
    try {
      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });
      setPosition(pos);
      return pos;
    } catch (err: any) {
      const msg = err?.message || 'Error al obtener la posicion GPS.';
      setError(msg);
      return null;
    }
  }, []);

  /**
   * Inicia el rastreo continuo de ubicacion en tiempo real
   */
  const startTracking = useCallback(async (): Promise<string | null> => {
    setError(null);
    try {
      // Si ya hay un tracking activo, lo detenemos primero
      if (watchIdRef.current) {
        await Geolocation.clearWatch({ id: watchIdRef.current });
      }

      const id: CallbackID = await Geolocation.watchPosition(
        { enableHighAccuracy: true, timeout: 10000 },
        (pos, err) => {
          if (err) {
            setError(err.message || 'Error en el rastreo continuo.');
            return;
          }
          if (pos) {
            setPosition(pos);
          }
        }
      );

      setWatchId(id);
      return id;
    } catch (err: any) {
      const msg = err?.message || 'Error al iniciar watchPosition.';
      setError(msg);
      return null;
    }
  }, []);

  /**
   * Detiene el rastreo continuo
   */
  const stopTracking = useCallback(async (): Promise<void> => {
    if (watchIdRef.current) {
      try {
        await Geolocation.clearWatch({ id: watchIdRef.current });
      } catch (err: any) {
        console.warn('Error al limpiar watchPosition:', err);
      } finally {
        setWatchId(null);
      }
    }
  }, []);

  // Cleanup al desmontar el hook
  useEffect(() => {
    return () => {
      if (watchIdRef.current) {
        Geolocation.clearWatch({ id: watchIdRef.current }).catch(() => {});
      }
    };
  }, []);

  return {
    position,
    watchId,
    error,
    getCurrentLocation,
    startTracking,
    stopTracking
  };
}
