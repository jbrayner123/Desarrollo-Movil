import { useEffect, useState, type DependencyList } from 'react';
import type { Unsubscribe } from 'firebase/firestore';

type Subscriber<T> = (onData: (data: T) => void, onError: (e: Error) => void) => Unsubscribe;

/**
 * Suscripcion en tiempo real generica (Firestore onSnapshot).
 * Se cancela sola al desmontar o al cambiar las dependencias, sin fugas de memoria.
 * Si `subscribe` es null no se suscribe (por ejemplo, sin sesion).
 */
export function useRealtime<T>(subscribe: Subscriber<T> | null, deps: DependencyList, initial: T) {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(Boolean(subscribe));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!subscribe) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = subscribe(
      (value) => {
        setData(value);
        setLoading(false);
        setError(null);
      },
      (e) => {
        setError(e.message.includes('permission') ? 'No tienes permiso para ver esta información.' : 'No se pudo cargar la información.');
        setLoading(false);
      }
    );
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error };
}
