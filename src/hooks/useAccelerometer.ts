// parcial-02/src/hooks/useAccelerometer.ts
import { useState, useRef, useEffect, useCallback } from 'react';
import { Motion } from '@capacitor/motion';
import type { PluginListenerHandle } from '@capacitor/core';

export interface UseAccelerometerResult {
  accelX: number;
  accelY: number;
  accelZ: number;
  motionMagnitude: number;
  isStill: boolean;
  elapsedSeconds: number;
  targetSeconds: number;
  isComplete: boolean;
  isListening: boolean;
  isShaking: boolean;
  startDetection: () => Promise<void>;
  stopDetection: () => void;
  resetTimer: () => void;
  simulateStillnessSuccess: () => void;
  error: string | null;
}

const STILLNESS_THRESHOLD = 1.35; // Umbral de variacion para considerar quietud
const TARGET_SECONDS = 10;

export function useAccelerometer(onCompletedCallback?: () => void): UseAccelerometerResult {
  const [accelX, setAccelX] = useState<number>(0);
  const [accelY, setAccelY] = useState<number>(0);
  const [accelZ, setAccelZ] = useState<number>(0);
  const [motionMagnitude, setMotionMagnitude] = useState<number>(0);
  const [isStill, setIsStill] = useState<boolean>(true);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const listenerRef = useRef<PluginListenerHandle | null>(null);
  const prevAccelRef = useRef<{ x: number; y: number; z: number } | null>(null);
  const timerIntervalRef = useRef<any>(null);
  const elapsedRef = useRef<number>(0);
  const onCompletedRef = useRef(onCompletedCallback);
  onCompletedRef.current = onCompletedCallback;

  const triggerShakeEffect = useCallback(() => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  }, []);

  const resetTimer = useCallback(() => {
    setElapsedSeconds(0);
    elapsedRef.current = 0;
  }, []);

  const handleMotionSample = useCallback((x: number, y: number, z: number) => {
    setAccelX(Math.round(x * 100) / 100);
    setAccelY(Math.round(y * 100) / 100);
    setAccelZ(Math.round(z * 100) / 100);

    if (prevAccelRef.current) {
      const dx = Math.abs(x - prevAccelRef.current.x);
      const dy = Math.abs(y - prevAccelRef.current.y);
      const dz = Math.abs(z - prevAccelRef.current.z);
      const deltaMag = Math.sqrt(dx * dx + dy * dy + dz * dz);
      setMotionMagnitude(Math.round(deltaMag * 100) / 100);

      const stillNow = deltaMag < STILLNESS_THRESHOLD;
      setIsStill(stillNow);

      if (!stillNow) {
        // Movimiento brusco detectado: reiniciar cronometro de 10s
        if (elapsedRef.current > 0.5) {
          triggerShakeEffect();
        }
        resetTimer();
      }
    }

    prevAccelRef.current = { x, y, z };
  }, [triggerShakeEffect, resetTimer]);

  const startDetection = async () => {
    setError(null);
    setIsComplete(false);
    resetTimer();

    try {
      const handle = await Motion.addListener('accel', (event) => {
        if (event.acceleration) {
          handleMotionSample(
            event.acceleration.x || 0,
            event.acceleration.y || 0,
            event.acceleration.z || 0
          );
        }
      });

      listenerRef.current = handle;
      setIsListening(true);

      // Iniciar conteo de 10 segundos continuos
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => {
          const next = Math.round((prev + 0.1) * 10) / 10;
          elapsedRef.current = next;

          if (next >= TARGET_SECONDS) {
            clearInterval(timerIntervalRef.current);
            setIsComplete(true);
            if (onCompletedRef.current) onCompletedRef.current();
            return TARGET_SECONDS;
          }
          return next;
        });
      }, 100);
    } catch (err: any) {
      console.warn('Error iniciando sensor Motion:', err);
      setError(err.message || 'Sensor de acelerometro no disponible');
      setIsListening(false);
    }
  };

  const stopDetection = () => {
    if (listenerRef.current) {
      listenerRef.current.remove().catch(() => {});
      listenerRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setIsListening(false);
    prevAccelRef.current = null;
  };

  const simulateStillnessSuccess = () => {
    setElapsedSeconds(TARGET_SECONDS);
    elapsedRef.current = TARGET_SECONDS;
    setIsComplete(true);
    if (onCompletedRef.current) onCompletedRef.current();
  };

  useEffect(() => {
    return () => {
      stopDetection();
    };
  }, []);

  return {
    accelX,
    accelY,
    accelZ,
    motionMagnitude,
    isStill,
    elapsedSeconds,
    targetSeconds: TARGET_SECONDS,
    isComplete,
    isListening,
    isShaking,
    startDetection,
    stopDetection,
    resetTimer,
    simulateStillnessSuccess,
    error
  };
}
