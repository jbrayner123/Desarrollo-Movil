// src/hooks/useAccelerometer.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { Motion } from '@capacitor/motion';
import { PluginListenerHandle } from '@capacitor/core';

export interface AccelerometerOptions {
  threshold?: number;
  interval?: number;
  shakeDelay?: number;
}

export interface AccelerationVector {
  x: number;
  y: number;
  z: number;
}

/**
 * Custom Hook para gestionar el sensor de acelerometro y deteccion de movimiento/agitacion (@capacitor/motion).
 */
export function useAccelerometer(options: AccelerometerOptions = {}) {
  const { threshold = 20, interval = 100, shakeDelay = 1000 } = options;

  const [acceleration, setAcceleration] = useState<AccelerationVector>({ x: 0, y: 0, z: 0 });
  const [magnitude, setMagnitude] = useState<number>(0);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [isMoving, setIsMoving] = useState<boolean>(false);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Referencias para control temporal y suscripcion
  const lastUpdate = useRef<number>(0);
  const lastShake = useRef<number>(0);
  const listenerRef = useRef<PluginListenerHandle | null>(null);
  const shakeTimeoutRef = useRef<any>(null);

  /**
   * Inicia la suscripcion a los eventos del acelerometro
   */
  const start = useCallback(async (): Promise<void> => {
    setError(null);
    try {
      if (listenerRef.current) {
        await listenerRef.current.remove();
        listenerRef.current = null;
      }

      const handle = await Motion.addListener('accel', (event) => {
        const now = Date.now();
        if (now - lastUpdate.current < interval) {
          return;
        }
        lastUpdate.current = now;

        const x = event.acceleration?.x ?? event.accelerationIncludingGravity?.x ?? 0;
        const y = event.acceleration?.y ?? event.accelerationIncludingGravity?.y ?? 0;
        const z = event.acceleration?.z ?? event.accelerationIncludingGravity?.z ?? 0;

        setAcceleration({ x, y, z });

        // Calculo de suma absoluta y magnitud euclidea
        const total = Math.abs(x) + Math.abs(y) + Math.abs(z);
        const mag = Math.sqrt(x * x + y * y + z * z);
        setMagnitude(mag);

        // Movimiento: si la variacion total supera 2
        setIsMoving(total > 2);

        // Deteccion de Shake (agitacion)
        if (total > threshold) {
          if (now - lastShake.current > shakeDelay) {
            lastShake.current = now;
            setIsShaking(true);

            if (shakeTimeoutRef.current) {
              clearTimeout(shakeTimeoutRef.current);
            }
            shakeTimeoutRef.current = setTimeout(() => {
              setIsShaking(false);
            }, 800);
          }
        }
      });

      listenerRef.current = handle;
      setIsActive(true);
    } catch (err: any) {
      setError(err?.message || 'Error al iniciar listener de acelerometro.');
      setIsActive(false);
    }
  }, [interval, threshold, shakeDelay]);

  /**
   * Detiene el acelerometro y remueve el listener
   */
  const stop = useCallback(async (): Promise<void> => {
    try {
      if (listenerRef.current) {
        await listenerRef.current.remove();
        listenerRef.current = null;
      }
      setIsActive(false);
      setIsMoving(false);
      setIsShaking(false);
    } catch (err: any) {
      console.warn('Error al detener Motion:', err);
    }
  }, []);

  // Iniciar automaticamente al montar y limpiar al desmontar
  useEffect(() => {
    start();
    return () => {
      if (shakeTimeoutRef.current) {
        clearTimeout(shakeTimeoutRef.current);
      }
      if (listenerRef.current) {
        listenerRef.current.remove().catch(() => {});
      }
    };
  }, [start]);

  return {
    acceleration,
    magnitude,
    isShaking,
    isMoving,
    isActive,
    error,
    start,
    stop
  };
}
