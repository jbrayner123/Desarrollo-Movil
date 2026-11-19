/**
 * Manejo de errores HTTP: traduce codigos de estado y fallos de red a mensajes
 * entendibles. Lo usan el cliente HTTP (lib/http.ts) y los servicios de la Fase 2.
 */

export class HttpError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = 'HttpError';
  }
}

const MESSAGES: Record<number, string> = {
  400: 'La solicitud no es válida. Revisa los datos enviados.',
  401: 'Tu sesión expiró. Inicia sesión de nuevo.',
  403: 'No tienes permisos para realizar esta acción.',
  404: 'No encontramos lo que buscabas.',
  409: 'Este registro ya existe.',
  413: 'El archivo es demasiado grande.',
  422: 'Algunos datos no son válidos.',
  429: 'Hiciste demasiadas solicitudes. Espera un momento e intenta de nuevo.',
  500: 'El servidor tuvo un problema. Intenta más tarde.',
  503: 'El servicio no está disponible en este momento.'
};

export const messageForStatus = (status: number): string =>
  MESSAGES[status] ?? (status >= 500 ? MESSAGES[500] : 'Ocurrió un error inesperado.');

/** true si el error proviene de cancelar una peticion con AbortController. */
export const isAbortError = (error: unknown): boolean =>
  error instanceof DOMException && error.name === 'AbortError';

/** Convierte cualquier error en un mensaje para mostrar al usuario. */
export function toUserMessage(error: unknown): string {
  if (error instanceof HttpError) return error.message;
  if (error instanceof TypeError) return 'No hay conexión con el servidor. Revisa tu internet.';
  if (error instanceof Error && error.message) return error.message;
  return 'Ocurrió un error inesperado.';
}
