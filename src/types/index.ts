/** Punto GPS capturado durante una sesion de seguimiento. */
export interface Coordenada {
  lat: number;
  lng: number;
  /** Precision reportada por el GPS, en metros. */
  precision: number;
  /** Marca de tiempo en milisegundos (epoch). */
  timestamp: number;
}

/** Motivo por el que finalizo una sesion de seguimiento. */
export type MotivoFin = 'manual' | 'bateria_baja';

/** Sesion de seguimiento persistida en el historial (formato JSON). */
export interface SesionRuta {
  id: string;
  /** Fecha legible de inicio, ej. "18/11/2026". */
  fecha: string;
  /** Hora legible de inicio, ej. "21:15:04". */
  horaInicio: string;
  horaFin: string;
  inicioISO: string;
  finISO: string;
  coordenadas: Coordenada[];
  direccionInicio: string;
  direccionFin: string;
  distanciaMetros: number;
  duracionSegundos: number;
  motivoFin: MotivoFin;
}

/** Estado de la bateria normalizado (nivel en porcentaje 0-100). */
export interface EstadoBateria {
  nivel: number | null;
  cargando: boolean;
}
