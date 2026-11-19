import { Preferences } from '@capacitor/preferences';
import { CLAVE_HISTORIAL } from '../config/constants';
import type { Coordenada, SesionRuta } from '../types';

/**
 * Persistencia del historial de rutas con @capacitor/preferences.
 * Todo el historial se guarda como un arreglo JSON bajo una sola clave
 * (SharedPreferences en Android, localStorage en web).
 */

export async function listarSesiones(): Promise<SesionRuta[]> {
  const { value } = await Preferences.get({ key: CLAVE_HISTORIAL });
  if (!value) return [];
  try {
    const sesiones = JSON.parse(value) as SesionRuta[];
    return Array.isArray(sesiones) ? sesiones : [];
  } catch {
    // Si el JSON esta corrupto se descarta en lugar de romper la app.
    return [];
  }
}

async function escribir(sesiones: SesionRuta[]): Promise<void> {
  await Preferences.set({ key: CLAVE_HISTORIAL, value: JSON.stringify(sesiones) });
}

/** Agrega una sesion al inicio del historial (mas reciente primero). */
export async function guardarSesion(sesion: SesionRuta): Promise<SesionRuta[]> {
  const sesiones = [sesion, ...(await listarSesiones())];
  await escribir(sesiones);
  return sesiones;
}

export async function eliminarSesion(id: string): Promise<SesionRuta[]> {
  const sesiones = (await listarSesiones()).filter((s) => s.id !== id);
  await escribir(sesiones);
  return sesiones;
}

export async function borrarHistorial(): Promise<void> {
  await Preferences.remove({ key: CLAVE_HISTORIAL });
}

/** Distancia total del recorrido usando la formula de Haversine (metros). */
export function calcularDistancia(puntos: Coordenada[]): number {
  const R = 6_371_000;
  const rad = (g: number) => (g * Math.PI) / 180;
  let total = 0;
  for (let i = 1; i < puntos.length; i++) {
    const a = puntos[i - 1];
    const b = puntos[i];
    const dLat = rad(b.lat - a.lat);
    const dLng = rad(b.lng - a.lng);
    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
    total += 2 * R * Math.asin(Math.sqrt(h));
  }
  return total;
}
