/** Utilidades de formato de fechas, distancias y textos. */

const MINUTE = 60;
const HOUR = 3600;
const DAY = 86_400;

/** "Hace 12 min", "Hace 1 h", "Hace 3 d" o la fecha corta si es mas antiguo. */
export function timeAgo(iso: string, now: Date = new Date()): string {
  const seconds = Math.max(0, Math.round((now.getTime() - new Date(iso).getTime()) / 1000));
  if (seconds < MINUTE) return 'Ahora';
  if (seconds < HOUR) return `Hace ${Math.floor(seconds / MINUTE)} min`;
  if (seconds < DAY) return `Hace ${Math.floor(seconds / HOUR)} h`;
  if (seconds < DAY * 7) return `Hace ${Math.floor(seconds / DAY)} d`;
  return new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
}

/** Hora de un chat: "9:41" si es hoy, "Ayer" o la fecha corta. */
export function chatTime(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) return date.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit', hour12: false });

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Ayer';

  return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
}

/** Hora corta para burbujas de mensaje: "9:41". */
export const messageTime = (iso: string): string =>
  new Date(iso).toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit', hour12: false });

/** 0.8 -> "0,8 km"; 0.04 -> "40 m" (solo por debajo de 100 m se usan metros). */
export function formatDistance(km: number): string {
  if (km < 0.1) return `${Math.round(km * 1000)} m`;
  return `${km.toLocaleString('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km`;
}

/** 1284 -> "1.284". */
export const formatNumber = (n: number): string => n.toLocaleString('es-CO');

/** "Mariana Lopez" -> "ML". */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    // Solo palabras que empiezan con letra o numero: "Mariana & Milo" -> "MM".
    .filter((w) => /^[\p{L}\p{N}]/u.test(w))
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}
