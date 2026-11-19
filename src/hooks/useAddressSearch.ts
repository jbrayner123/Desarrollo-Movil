import { useEffect, useState } from 'react';
import { searchAddress, type AddressResult } from '../services/opencagedata';
import { isAbortError, toUserMessage } from '../helpers/httpErrors';

/**
 * Busqueda de direcciones con OpenCage mientras el usuario escribe.
 * Espera 500 ms tras la ultima tecla y cancela con AbortController la busqueda
 * anterior o la pendiente al desmontar.
 */
export function useAddressSearch(text: string, enabled = true) {
  const [results, setResults] = useState<AddressResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || text.trim().length < 4) {
      setResults([]);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    const id = window.setTimeout(async () => {
      setLoading(true);
      try {
        setResults(await searchAddress(text, controller.signal));
        setError(null);
      } catch (e) {
        if (!isAbortError(e)) setError(toUserMessage(e));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 500);

    return () => {
      window.clearTimeout(id);
      controller.abort();
    };
  }, [text, enabled]);

  return { results, loading, error };
}
