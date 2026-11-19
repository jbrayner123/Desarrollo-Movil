import { useLiveQuery } from 'dexie-react-hooks';
import { localDb, type Draft } from '../lib/db';

/**
 * Consultas reactivas a la base local (Dexie / IndexedDB).
 * Los componentes se actualizan solos cuando cambian los datos guardados.
 */

/** Publicaciones del feed guardadas para verlas sin conexion. */
export function useCachedPosts() {
  return useLiveQuery(() => localDb.cachedPosts.orderBy('createdAt').reverse().toArray(), [], []);
}

/** Borradores creados sin conexion, del mas reciente al mas antiguo. */
export function useDrafts() {
  return useLiveQuery(() => localDb.drafts.orderBy('createdAt').reverse().toArray(), [], [] as Draft[]);
}

export const saveDraft = (draft: Omit<Draft, 'id'>) => localDb.drafts.add(draft);
export const deleteDraft = (id: number) => localDb.drafts.delete(id);
