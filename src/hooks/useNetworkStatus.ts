import { useCallback, useEffect, useState } from 'react';
import { Network, type ConnectionStatus } from '@capacitor/network';

/**
 * Estado de conexion con @capacitor/network.
 * - `conectado`: estado reactivo (se actualiza con el listener networkStatusChange).
 * - `verificarConexion()`: consulta puntual antes de llamar a OpenCage o recargar el mapa.
 */
export function useNetworkStatus() {
  const [estado, setEstado] = useState<ConnectionStatus>({
    connected: true,
    connectionType: 'unknown'
  });

  useEffect(() => {
    let activo = true;
    Network.getStatus().then((s) => activo && setEstado(s));

    const suscripcion = Network.addListener('networkStatusChange', (s) => setEstado(s));
    return () => {
      activo = false;
      suscripcion.then((h) => h.remove());
    };
  }, []);

  const verificarConexion = useCallback(async (): Promise<boolean> => {
    const s = await Network.getStatus();
    setEstado(s);
    return s.connected;
  }, []);

  return {
    conectado: estado.connected,
    tipoConexion: estado.connectionType,
    verificarConexion
  };
}
