// src/hooks/useNetwork.ts
import { useState, useEffect } from 'react';
import { Network, ConnectionStatus, ConnectionType } from '@capacitor/network';

/**
 * Custom Hook para gestionar el sensor de red y conectividad (@capacitor/network).
 */
export function useNetwork() {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [connectionType, setConnectionType] = useState<string>('wifi');

  useEffect(() => {
    let isMounted = true;
    let handle: any = null;

    const checkStatus = async () => {
      try {
        const status: ConnectionStatus = await Network.getStatus();
        if (isMounted) {
          setIsOnline(status.connected);
          setConnectionType(status.connectionType || (status.connected ? 'wifi' : 'none'));
        }
      } catch {
        if (isMounted) {
          setIsOnline(navigator.onLine);
          setConnectionType(navigator.onLine ? 'wifi' : 'none');
        }
      }
    };

    checkStatus();

    Network.addListener('networkStatusChange', (status: ConnectionStatus) => {
      if (isMounted) {
        setIsOnline(status.connected);
        setConnectionType(status.connectionType || (status.connected ? 'wifi' : 'none'));
      }
    }).then((h) => {
      handle = h;
    });

    return () => {
      isMounted = false;
      if (handle) {
        handle.remove();
      }
    };
  }, []);

  return {
    isOnline,
    connectionType
  };
}
