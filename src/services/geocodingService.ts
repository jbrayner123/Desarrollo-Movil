import { OPENCAGE_API_KEY } from '../config/constants';

/**
 * Servicio de geocodificacion inversa con OpenCage Data.
 * Convierte latitud/longitud en una direccion legible.
 * La verificacion de red se hace antes de llamar a este servicio (ver useNetworkStatus).
 */

const OPENCAGE_URL = 'https://api.opencagedata.com/geocode/v1/json';

interface OpenCageResponse {
  results: { formatted: string }[];
  status: { code: number; message: string };
}

export class GeocodingError extends Error {}

export const tieneApiKey = (): boolean =>
  OPENCAGE_API_KEY.length > 0 && OPENCAGE_API_KEY !== 'tu_api_key_de_opencage';

/** Formato de respaldo cuando no se puede resolver la direccion. */
export const formatearCoordenadas = (lat: number, lng: number): string =>
  `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

export async function obtenerDireccion(lat: number, lng: number): Promise<string> {
  if (!tieneApiKey()) {
    throw new GeocodingError('Falta configurar VITE_OPENCAGE_API_KEY en el archivo .env');
  }

  const params = new URLSearchParams({
    q: `${lat}+${lng}`,
    key: OPENCAGE_API_KEY,
    language: 'es',
    no_annotations: '1',
    limit: '1'
  });

  const respuesta = await fetch(`${OPENCAGE_URL}?${params.toString()}`);
  if (!respuesta.ok) {
    throw new GeocodingError(`OpenCage respondio con estado ${respuesta.status}`);
  }

  const datos: OpenCageResponse = await respuesta.json();
  if (datos.status.code !== 200) {
    throw new GeocodingError(datos.status.message);
  }

  return datos.results[0]?.formatted ?? formatearCoordenadas(lat, lng);
}
