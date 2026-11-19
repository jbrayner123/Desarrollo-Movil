import { HttpError, messageForStatus } from '../helpers/httpErrors';

/**
 * Cliente HTTP reutilizable sobre fetch.
 * - Cancela con AbortController: recibe la senal del componente (al desmontar o
 *   cambiar la busqueda) y agrega un tiempo maximo de espera.
 * - Convierte los errores HTTP en HttpError con un mensaje entendible.
 */

interface RequestOptions extends Omit<RequestInit, 'signal'> {
  signal?: AbortSignal;
  /** Tiempo maximo en milisegundos (por defecto 12 s). */
  timeoutMs?: number;
  query?: Record<string, string | number | undefined>;
}

export async function http<T>(url: string, { signal, timeoutMs = 12_000, query, ...init }: RequestOptions = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(new DOMException('Tiempo agotado', 'TimeoutError')), timeoutMs);
  const onAbort = () => controller.abort(signal?.reason);
  signal?.addEventListener('abort', onAbort);

  const target = new URL(url);
  Object.entries(query ?? {}).forEach(([k, v]) => v !== undefined && target.searchParams.set(k, String(v)));

  try {
    const response = await fetch(target, { ...init, signal: controller.signal });
    if (!response.ok) throw new HttpError(messageForStatus(response.status), response.status);
    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      throw new HttpError('El servicio tardó demasiado en responder.');
    }
    // Una cancelacion se relanza como AbortError para que el llamador la ignore.
    if (controller.signal.aborted && signal?.aborted) throw new DOMException('Cancelado', 'AbortError');
    throw error;
  } finally {
    window.clearTimeout(timeout);
    signal?.removeEventListener('abort', onAbort);
  }
}
