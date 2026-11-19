import type { GeoPoint } from '../types';

/** Distancia en kilometros entre dos puntos (formula de Haversine). */
export function distanceKm(a: GeoPoint, b: GeoPoint): number {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Abre Google Maps con la ruta hasta el punto. */
export const directionsUrl = (p: GeoPoint): string =>
  `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`;
