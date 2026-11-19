/** Configuracion centralizada del Challenge 09. */

/** Porcentaje de bateria por debajo del cual se detiene el tracking. */
export const UMBRAL_BATERIA_PORCENTAJE = 15;

/** Cada cuanto se consulta la bateria mientras hay tracking activo (ms). */
export const INTERVALO_BATERIA_MS = 30_000;

/** Clave de almacenamiento del historial en @capacitor/preferences. */
export const CLAVE_HISTORIAL = 'challenge09_historial_rutas';

/** Ubicacion por defecto mientras no hay GPS (Cali, Colombia). */
export const CENTRO_POR_DEFECTO: [number, number] = [3.4516, -76.532];

export const ZOOM_POR_DEFECTO = 16;

/** Clave de OpenCage leida desde .env (VITE_OPENCAGE_API_KEY). */
export const OPENCAGE_API_KEY = import.meta.env.VITE_OPENCAGE_API_KEY ?? '';
