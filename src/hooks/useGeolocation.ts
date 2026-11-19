import { useCallback, useEffect, useRef, useState } from 'react';
import { Geolocation, type Position } from '@capacitor/geolocation';
import type { Coordenada } from '../types';

const OPCIONES_GPS = { enableHighAccuracy: true, timeout: 15_000, maximumAge: 0 };
const PERMISO_DENEGADO = 'Permiso de ubicacion denegado';

const aCoordenada = (p: Position): Coordenada => ({
  lat: p.coords.latitude,
  lng: p.coords.longitude,
  precision: Math.round(p.coords.accuracy),
  timestamp: p.timestamp
});

/** Solicita permisos en nativo; en web el navegador los pide al leer la posicion. */
async function asegurarPermisos(): Promise<void> {
  try {
    const estado = await Geolocation.checkPermissions();
    if (estado.location !== 'granted') {
      const solicitud = await Geolocation.requestPermissions();
      if (solicitud.location === 'denied') throw new Error(PERMISO_DENEGADO);
    }
  } catch (e) {
    // En web requestPermissions no esta implementado: se deja que el navegador pregunte.
    if (e instanceof Error && e.message === PERMISO_DENEGADO) throw e;
  }
}

/**
 * Geolocalizacion y seguimiento de ruta con @capacitor/geolocation.
 * - `obtenerPosicionActual()`: lectura puntual.
 * - `iniciarSeguimiento()` / `detenerSeguimiento()`: watchPosition acumulando la ruta.
 */
export function useGeolocation() {
  const [posicion, setPosicion] = useState<Coordenada | null>(null);
  const [ruta, setRuta] = useState<Coordenada[]>([]);
  const [rastreando, setRastreando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const watchIdRef = useRef<string | null>(null);
  const rutaRef = useRef<Coordenada[]>([]);

  const obtenerPosicionActual = useCallback(async (): Promise<Coordenada | null> => {
    try {
      await asegurarPermisos();
      const p = aCoordenada(await Geolocation.getCurrentPosition(OPCIONES_GPS));
      setPosicion(p);
      setError(null);
      return p;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo obtener la ubicacion');
      return null;
    }
  }, []);

  /**
   * Inicia el watch. `onPrimerPunto` se llama una sola vez con la primera
   * coordenada recibida (se usa para resolver la direccion de inicio).
   */
  const iniciarSeguimiento = useCallback(
    async (onPrimerPunto?: (p: Coordenada) => void): Promise<boolean> => {
      if (watchIdRef.current) return true;
      try {
        await asegurarPermisos();
        rutaRef.current = [];
        setRuta([]);

        watchIdRef.current = await Geolocation.watchPosition(OPCIONES_GPS, (p, err) => {
          if (err || !p) {
            setError(err?.message ?? 'Senal GPS no disponible');
            return;
          }
          const punto = aCoordenada(p);
          if (rutaRef.current.length === 0) onPrimerPunto?.(punto);
          rutaRef.current = [...rutaRef.current, punto];
          setRuta(rutaRef.current);
          setPosicion(punto);
          setError(null);
        });

        setRastreando(true);
        return true;
      } catch (e) {
        setError(e instanceof Error ? e.message : 'No se pudo iniciar el seguimiento');
        return false;
      }
    },
    []
  );

  /** Detiene el watch y devuelve los puntos capturados durante la sesion. */
  const detenerSeguimiento = useCallback(async (): Promise<Coordenada[]> => {
    if (watchIdRef.current) {
      await Geolocation.clearWatch({ id: watchIdRef.current });
      watchIdRef.current = null;
    }
    setRastreando(false);
    return rutaRef.current;
  }, []);

  // Limpieza si el componente se desmonta con el tracking activo.
  useEffect(
    () => () => {
      if (watchIdRef.current) Geolocation.clearWatch({ id: watchIdRef.current });
    },
    []
  );

  return {
    posicion,
    ruta,
    rastreando,
    error,
    obtenerPosicionActual,
    iniciarSeguimiento,
    detenerSeguimiento
  };
}
