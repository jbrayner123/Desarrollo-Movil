/** Utilidades de formato compartidas por la interfaz. */

export const formatearDistancia = (metros: number): string =>
  metros >= 1000 ? `${(metros / 1000).toFixed(2)} km` : `${Math.round(metros)} m`;

export const formatearDuracion = (segundos: number): string => {
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  const s = Math.floor(segundos % 60);
  return h > 0 ? `${h} h ${m} min` : m > 0 ? `${m} min ${s} s` : `${s} s`;
};

export const formatearFecha = (d: Date): string =>
  d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });

export const formatearHora = (d: Date): string =>
  d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
