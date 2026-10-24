// src/hooks/useNetwork.ts
import { useState, useEffect, useCallback } from 'react';
import { Network, ConnectionStatus } from '@capacitor/network';

export type ConnectionType = 'wifi' | 'cellular' | 'none' | 'unknown';

// Variable de estado global para permitir simular desconexión en pruebas/evaluación
let simulatedOffline: boolean = false;
const listeners = new Set<(isSimulated: boolean) => void>();

export function setSimulatedOfflineMode(value: boolean) {
  simulatedOffline = value;
  listeners.forEach((fn) => fn(value));
}

export function getSimulatedOfflineMode(): boolean {
  return simulatedOffline;
}

/**
 * Custom Hook para monitorear el estado de red con @capacitor/network.
 * Detecta conectividad y tipo de conexión (wifi | cellular | none | unknown).
 */
export function useNetwork() {
  const [realIsOnline, setRealIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [realConnectionType, setRealConnectionType] = useState<ConnectionType>('wifi');
  const [isSimulated, setIsSimulated] = useState<boolean>(simulatedOffline);

  useEffect(() => {
    let isMounted = true;
    let listenerHandle: { remove: () => Promise<void> } | null = null;

    // 1. Estado inicial con Network.getStatus()
    const checkInitialStatus = async () => {
      try {
        const status: ConnectionStatus = await Network.getStatus();
        if (isMounted) {
          setRealIsOnline(status.connected);
          setRealConnectionType((status.connectionType as ConnectionType) || (status.connected ? 'wifi' : 'none'));
        }
      } catch (err) {
        console.warn('[useNetwork] Fallback a navigator.onLine:', err);
        if (isMounted) {
          const online = typeof navigator !== 'undefined' ? navigator.onLine : true;
          setRealIsOnline(online);
          setRealConnectionType(online ? 'wifi' : 'none');
        }
      }
    };

    checkInitialStatus();

    // 2. Suscripción a networkStatusChange
    Network.addListener('networkStatusChange', (status: ConnectionStatus) => {
      if (isMounted) {
        setRealIsOnline(status.connected);
        setRealConnectionType((status.connectionType as ConnectionType) || (status.connected ? 'wifi' : 'none'));
      }
    }).then((handle) => {
      listenerHandle = handle;
    });

    // 3. Listener para simulación de pruebas
    const onSimChange = (val: boolean) => {
      if (isMounted) setIsSimulated(val);
    };
    listeners.add(onSimChange);

    // 4. Cleanup
    return () => {
      isMounted = false;
      if (listenerHandle) {
        listenerHandle.remove();
      }
      listeners.delete(onSimChange);
    };
  }, []);

  const isOnline = isSimulated ? false : realIsOnline;
  const connectionType: ConnectionType = isSimulated ? 'none' : realConnectionType;

  const toggleSimulatedOffline = useCallback(() => {
    const nextVal = !simulatedOffline;
    setSimulatedOfflineMode(nextVal);
  }, []);

  return {
    isOnline,
    connectionType,
    isSimulated,
    toggleSimulatedOffline
  };
}
