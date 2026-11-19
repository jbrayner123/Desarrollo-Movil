import { useCallback, useEffect, useRef, useState } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import type { GeoPoint } from '../types';

/** Centro de Cali: respaldo si no hay permiso de ubicacion. */
export const CALI_CENTER: GeoPoint = { lat: 3.4516, lng: -76.532 };

const PRECISE = { enableHighAccuracy: true, timeout: 15_000, maximumAge: 10_000 };
/** Modo ahorro: sin GPS de alta precision y aceptando posiciones de hasta 2 minutos. */
const SAVER = { enableHighAccuracy: false, timeout: 20_000, maximumAge: 120_000 };

async function ensurePermission(): Promise<void> {
  try {
    const status = await Geolocation.checkPermissions();
    if (status.location !== 'granted') {
      const req = await Geolocation.requestPermissions();
      if (req.location === 'denied') throw new Error('denied');
    }
  } catch (e) {
    // En el navegador requestPermissions no existe: el navegador pregunta al leer la posicion.
    if (e instanceof Error && e.message === 'denied') throw new Error('Activa el permiso de ubicación para ver lo que hay cerca.');
  }
}

interface Options {
  /** Seguimiento continuo (watchPosition) en lugar de una sola lectura. */
  watch?: boolean;
  /** Ahorro de energia, por ejemplo con bateria baja. */
  lowPower?: boolean;
}

/**
 * Ubicacion con @capacitor/geolocation.
 * - Lectura puntual con `locate()`.
 * - Seguimiento opcional; en modo ahorro se desactiva y solo se hace una lectura.
 */
export function useGeolocation({ watch = false, lowPower = false }: Options = {}) {
  const [position, setPosition] = useState<GeoPoint | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const watchId = useRef<string | null>(null);

  const locate = useCallback(async (): Promise<GeoPoint | null> => {
    setLoading(true);
    try {
      await ensurePermission();
      const p = await Geolocation.getCurrentPosition(lowPower ? SAVER : PRECISE);
      const point = { lat: p.coords.latitude, lng: p.coords.longitude };
      setPosition(point);
      setError(null);
      return point;
    } catch (e) {
      setError(e instanceof Error && e.message.startsWith('Activa') ? e.message : 'No se pudo obtener tu ubicación.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [lowPower]);

  useEffect(() => {
    let cancelled = false;
    locate();
    // Con bateria baja no hay seguimiento continuo: solo la lectura inicial.
    if (!watch || lowPower) return;

    ensurePermission()
      .then(() =>
        Geolocation.watchPosition(PRECISE, (p, err) => {
          if (cancelled || err || !p) return;
          setPosition({ lat: p.coords.latitude, lng: p.coords.longitude });
        })
      )
      .then((id) => {
        if (cancelled) Geolocation.clearWatch({ id });
        else watchId.current = id;
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
      if (watchId.current) Geolocation.clearWatch({ id: watchId.current });
      watchId.current = null;
    };
  }, [watch, lowPower, locate]);

  return { position, error, loading, locate };
}
