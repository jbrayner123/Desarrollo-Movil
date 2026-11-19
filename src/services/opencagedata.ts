import { http } from '../lib/http';
import type { GeoPoint } from '../types';

/**
 * Servicio de OpenCage Data.
 * - reverseGeocode: coordenadas del GPS -> direccion legible.
 * - searchAddress: texto escrito -> coordenadas (limitado a Cali).
 * Ambas reciben un AbortSignal para cancelar al desmontar o al seguir escribiendo.
 */

const URL_BASE = 'https://api.opencagedata.com/geocode/v1/json';
const KEY = import.meta.env.VITE_OPENCAGE_API_KEY ?? '';

/** Rectangulo aproximado de Cali (oeste, sur, este, norte) para priorizar resultados. */
const CALI_BOUNDS = '-76.60,3.33,-76.45,3.52';

interface OpenCageResult {
  formatted: string;
  geometry: { lat: number; lng: number };
  components: {
    road?: string;
    house_number?: string;
    suburb?: string;
    neighbourhood?: string;
    quarter?: string;
    city?: string;
    town?: string;
    state?: string;
    _normalized_city?: string;
  };
}

interface OpenCageResponse {
  results: OpenCageResult[];
}

export interface AddressResult extends GeoPoint {
  /** Direccion completa formateada. */
  formatted: string;
  /** Calle y numero, o la direccion completa si no hay datos separados. */
  street: string;
  neighborhood: string;
  city: string;
  /** true si el resultado esta dentro de Cali. */
  inCali: boolean;
}

export const hasOpenCageKey = (): boolean => KEY.length > 0;

function toAddress(r: OpenCageResult): AddressResult {
  const c = r.components;
  const rawCity = c._normalized_city ?? c.city ?? c.town ?? '';
  // OpenCage devuelve "Cali ciudad": se muestra simplemente "Cali".
  const city = /cali/i.test(rawCity) ? 'Cali' : rawCity;
  const street = [c.road, c.house_number].filter(Boolean).join(' ') || r.formatted.split(',')[0];
  return {
    lat: r.geometry.lat,
    lng: r.geometry.lng,
    formatted: r.formatted,
    street,
    neighborhood: c.neighbourhood ?? c.suburb ?? c.quarter ?? '',
    city,
    inCali: /cali/i.test(city) || /cali/i.test(r.formatted)
  };
}

export async function reverseGeocode(point: GeoPoint, signal?: AbortSignal): Promise<AddressResult | null> {
  if (!hasOpenCageKey()) return null;
  const data = await http<OpenCageResponse>(URL_BASE, {
    signal,
    query: { q: `${point.lat}+${point.lng}`, key: KEY, language: 'es', no_annotations: 1, limit: 1 }
  });
  return data.results[0] ? toAddress(data.results[0]) : null;
}

export async function searchAddress(text: string, signal?: AbortSignal): Promise<AddressResult[]> {
  if (!hasOpenCageKey() || text.trim().length < 4) return [];
  const data = await http<OpenCageResponse>(URL_BASE, {
    signal,
    query: {
      q: /cali/i.test(text) ? text : `${text}, Cali, Colombia`,
      key: KEY,
      language: 'es',
      countrycode: 'co',
      bounds: CALI_BOUNDS,
      no_annotations: 1,
      limit: 5
    }
  });
  return data.results.map(toAddress);
}

/** Etiqueta corta para tarjetas: "San Fernando, Cali". */
export const shortLabel = (a: AddressResult): string =>
  [a.neighborhood || a.street, a.city || 'Cali'].filter(Boolean).join(', ');
