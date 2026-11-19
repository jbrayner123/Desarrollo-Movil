import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DEFAULT_LIMIT,
  GiphyServiceError,
  isRequestCanceled,
  searchGifs,
  type Gif
} from '../services/giphy.service';

interface GifSearchState {
  /** Termino de la busqueda mostrada actualmente. */
  query: string;
  gifs: Gif[];
  /** Carga de la primera pagina de una busqueda nueva. */
  loading: boolean;
  /** Carga de paginas adicionales ("Cargar mas"). */
  loadingMore: boolean;
  error: string | null;
  totalCount: number;
  nextOffset: number;
  hasMore: boolean;
}

const INITIAL_STATE: GifSearchState = {
  query: '',
  gifs: [],
  loading: false,
  loadingMore: false,
  error: null,
  totalCount: 0,
  nextOffset: 0,
  hasMore: false
};

/** Une dos paginas descartando GIFs repetidos (GIPHY a veces los repite entre paginas). */
const mergeUnique = (current: Gif[], incoming: Gif[]): Gif[] => {
  const seen = new Set(current.map((g) => g.id));
  return [...current, ...incoming.filter((g) => !seen.has(g.id))];
};

const toMessage = (error: unknown): string =>
  error instanceof GiphyServiceError ? error.message : 'Ocurrio un error inesperado al buscar GIFs.';

/**
 * Estado y acciones de la busqueda de GIFs.
 *
 * Control de concurrencia: solo hay una peticion activa a la vez. Cada busqueda
 * nueva, cada "Cargar mas", `cancel()` y el desmontaje del componente abortan la
 * peticion anterior con su AbortController. Ademas se compara el controlador al
 * terminar, para que una respuesta tardia nunca sobrescriba una busqueda mas reciente.
 */
export function useGifSearch(limit = DEFAULT_LIMIT) {
  const [state, setState] = useState<GifSearchState>(INITIAL_STATE);
  const controllerRef = useRef<AbortController | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  /** Aborta la peticion en curso (si existe) y crea un controlador nuevo. */
  const startRequest = (): AbortController => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    return controller;
  };

  const isCurrent = (controller: AbortController) =>
    controllerRef.current === controller && !controller.signal.aborted;

  /** Busqueda nueva desde la primera pagina. Un termino vacio limpia los resultados. */
  const search = useCallback(
    async (rawQuery: string, options: { force?: boolean } = {}) => {
      const query = rawQuery.trim();
      const current = stateRef.current;

      // Evita repetir la misma busqueda (por ejemplo, Enter seguido del debounce).
      if (!options.force && query === current.query && !current.error && (current.loading || current.gifs.length)) {
        return;
      }

      if (!query) {
        controllerRef.current?.abort();
        controllerRef.current = null;
        setState(INITIAL_STATE);
        return;
      }

      const controller = startRequest();
      setState({ ...INITIAL_STATE, query, loading: true });

      try {
        const result = await searchGifs({ q: query, limit, offset: 0 }, controller.signal);
        if (!isCurrent(controller)) return;
        setState({
          query,
          gifs: result.gifs,
          loading: false,
          loadingMore: false,
          error: null,
          totalCount: result.totalCount,
          nextOffset: result.nextOffset,
          hasMore: result.hasMore
        });
      } catch (error) {
        if (isRequestCanceled(error) || !isCurrent(controller)) return;
        setState({ ...INITIAL_STATE, query, error: toMessage(error) });
      }
    },
    [limit]
  );

  /** Pide la siguiente pagina de la busqueda actual y la agrega a la lista. */
  const loadMore = useCallback(async () => {
    const current = stateRef.current;
    if (!current.query || !current.hasMore || current.loading || current.loadingMore) return;

    const controller = startRequest();
    setState((s) => ({ ...s, loadingMore: true, error: null }));

    try {
      const result = await searchGifs({ q: current.query, limit, offset: current.nextOffset }, controller.signal);
      if (!isCurrent(controller)) return;
      setState((s) => ({
        ...s,
        gifs: mergeUnique(s.gifs, result.gifs),
        loadingMore: false,
        totalCount: result.totalCount,
        nextOffset: result.nextOffset,
        hasMore: result.hasMore
      }));
    } catch (error) {
      if (isRequestCanceled(error) || !isCurrent(controller)) return;
      setState((s) => ({ ...s, loadingMore: false, error: toMessage(error) }));
    }
  }, [limit]);

  /** Repite la ultima operacion que fallo. */
  const retry = useCallback(() => {
    const current = stateRef.current;
    if (current.gifs.length > 0) loadMore();
    else search(current.query, { force: true });
  }, [search, loadMore]);

  /** Cancela cualquier peticion en curso (por ejemplo, al salir de la vista). */
  const cancel = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    // Si se cancela la primera pagina no hay nada que conservar: se vuelve al estado
    // inicial para no mostrar un falso "sin resultados". Si ya habia GIFs se mantienen.
    setState((s) => (s.gifs.length > 0 ? { ...s, loading: false, loadingMore: false } : INITIAL_STATE));
  }, []);

  // Al desmontar el componente se cancela la peticion pendiente.
  useEffect(() => () => controllerRef.current?.abort(), []);

  const { query, gifs, loading, error } = state;

  return {
    ...state,
    /** Busqueda terminada sin resultados y sin error. */
    isEmpty: query.length > 0 && !loading && !error && gifs.length === 0,
    search,
    loadMore,
    retry,
    cancel
  };
}
