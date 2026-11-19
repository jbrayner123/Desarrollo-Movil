import { useEffect, useState } from 'react';

/**
 * Devuelve `value` solo cuando deja de cambiar durante `delayMs`.
 * Evita lanzar una peticion a GIPHY por cada tecla.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}
