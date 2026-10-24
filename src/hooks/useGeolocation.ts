// parcial-02/src/hooks/useGeolocation.ts
import { useState, useRef, useEffect } from 'react';
import { Geolocation } from '@capacitor/geolocation';

export interface UseGeolocationResult {
  currentLat: number | null;
  currentLng: number | null;
  originLat: number | null;
  originLng: number | null;
  distanceMeters: number;
  targetMeters: number;
  setTargetMeters: (meters: number) => void;
  isTracking: boolean;
  isGoalReached: boolean;
  startTracking: () => Promise<void>;
  stopTracking: () => void;
  resetTrip: () => void;
  simulateStep: (metersToAdd: number) => void;
  error: string | null;
}

// Calculo de distancia con formula de Haversine (en metros)
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Radio de la Tierra en metros
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function useGeolocation(initialTarget = 30): UseGeolocationResult {
  const [currentLat, setCurrentLat] = useState<number | null>(null);
  const [currentLng, setCurrentLng] = useState<number | null>(null);
  const [originLat, setOriginLat] = useState<number | null>(null);
  const [originLng, setOriginLng] = useState<number | null>(null);
  const [distanceMeters, setDistanceMeters] = useState<number>(0);
  const [targetMeters, setTargetMeters] = useState<number>(initialTarget);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const watchIdRef = useRef<string | null>(null);
  const originRef = useRef<{ lat: number; lng: number } | null>(null);

  const startTracking = async () => {
    setError(null);
    try {
      // 1. Obtener punto de origen inicial
      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });

      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      originRef.current = { lat, lng };
      setOriginLat(lat);
      setOriginLng(lng);
      setCurrentLat(lat);
      setCurrentLng(lng);
      setDistanceMeters(0);
      setIsTracking(true);

      // 2. Suscribirse a cambios continuos de posicion GPS
      const id = await Geolocation.watchPosition(
        {
          enableHighAccuracy: true,
          timeout: 10000
        },
        (position, err) => {
          if (err) {
            console.warn('Error en GPS watchPosition:', err);
            setError(err.message || 'Error recibiendo telemetria GPS');
            return;
          }
          if (position && originRef.current) {
            const newLat = position.coords.latitude;
            const newLng = position.coords.longitude;
            setCurrentLat(newLat);
            setCurrentLng(newLng);

            const dist = calculateHaversineDistance(
              originRef.current.lat,
              originRef.current.lng,
              newLat,
              newLng
            );
            setDistanceMeters(dist);
          }
        }
      );

      watchIdRef.current = id;
    } catch (err: any) {
      console.warn('Fallo al iniciar Geolocation:', err);
      setError(err.message || 'Permiso de ubicacion denegado');
      setIsTracking(false);
    }
  };

  const stopTracking = () => {
    if (watchIdRef.current) {
      Geolocation.clearWatch({ id: watchIdRef.current }).catch(() => {});
      watchIdRef.current = null;
    }
    setIsTracking(false);
  };

  const resetTrip = () => {
    stopTracking();
    originRef.current = null;
    setOriginLat(null);
    setOriginLng(null);
    setCurrentLat(null);
    setCurrentLng(null);
    setDistanceMeters(0);
    setError(null);
  };

  // Metodo auxiliar para demostracion en espacios reducidos durante la sustentacion
  const simulateStep = (metersToAdd: number) => {
    setDistanceMeters((prev) => Math.round((prev + metersToAdd) * 10) / 10);
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current) {
        Geolocation.clearWatch({ id: watchIdRef.current }).catch(() => {});
      }
    };
  }, []);

  const isGoalReached = distanceMeters >= targetMeters;

  return {
    currentLat,
    currentLng,
    originLat,
    originLng,
    distanceMeters,
    targetMeters,
    setTargetMeters,
    isTracking,
    isGoalReached,
    startTracking,
    stopTracking,
    resetTrip,
    simulateStep,
    error
  };
}
