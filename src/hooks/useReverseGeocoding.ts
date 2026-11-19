import { useCallback } from 'react';
import { formatearCoordenadas, obtenerDireccion } from '../services/geocodingService';

export interface ResultadoDireccion {
  direccion: string;
  /** true si la direccion vino de OpenCage; false si es un respaldo con coordenadas. */
  resuelta: boolean;
  aviso?: string;
}

/**
 * Envuelve el servicio de OpenCage verificando primero la red.
 * Nunca lanza: si no hay conexion o la API falla devuelve las coordenadas como texto.
 */
export function useReverseGeocoding(verificarConexion: () => Promise<boolean>) {
  const resolverDireccion = useCallback(
    async (lat: number, lng: number): Promise<ResultadoDireccion> => {
      const respaldo = formatearCoordenadas(lat, lng);

      if (!(await verificarConexion())) {
        return {
          direccion: respaldo,
          resuelta: false,
          aviso: 'Sin conexion: no se consulto OpenCage.'
        };
      }

      try {
        return { direccion: await obtenerDireccion(lat, lng), resuelta: true };
      } catch (e) {
        return {
          direccion: respaldo,
          resuelta: false,
          aviso: e instanceof Error ? e.message : 'No se pudo resolver la direccion.'
        };
      }
    },
    [verificarConexion]
  );

  return { resolverDireccion };
}
