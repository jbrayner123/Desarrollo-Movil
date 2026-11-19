import { useEffect, useState } from 'react';
import { Network, type ConnectionStatus } from '@capacitor/network';

/**
 * Conexion a internet en tiempo real con @capacitor/network.
 * En Android usa el estado nativo; en el navegador, los eventos online/offline.
 */
export function useNetwork() {
  const [status, setStatus] = useState<ConnectionStatus>({ connected: true, connectionType: 'unknown' });

  useEffect(() => {
    let active = true;
    Network.getStatus()
      .then((s) => active && setStatus(s))
      .catch(() => undefined);
    const listener = Network.addListener('networkStatusChange', (s) => setStatus(s));
    return () => {
      active = false;
      listener.then((h) => h.remove());
    };
  }, []);

  return { isOnline: status.connected, connectionType: status.connectionType };
}
