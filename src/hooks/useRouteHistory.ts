import { useCallback, useEffect, useState } from 'react';
import type { SesionRuta } from '../types';
import {
  borrarHistorial,
  eliminarSesion,
  guardarSesion,
  listarSesiones
} from '../services/routeStorageService';

/** Estado React sincronizado con el historial JSON guardado en Preferences. */
export function useRouteHistory() {
  const [sesiones, setSesiones] = useState<SesionRuta[]>([]);

  const recargar = useCallback(async () => setSesiones(await listarSesiones()), []);

  useEffect(() => {
    recargar();
  }, [recargar]);

  const guardar = useCallback(async (s: SesionRuta) => setSesiones(await guardarSesion(s)), []);
  const eliminar = useCallback(async (id: string) => setSesiones(await eliminarSesion(id)), []);
  const vaciar = useCallback(async () => {
    await borrarHistorial();
    setSesiones([]);
  }, []);

  return { sesiones, guardar, eliminar, vaciar, recargar };
}
