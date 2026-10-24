// src/hooks/useDexie.ts
import { useState, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { dexieDb } from '../db/db';

/**
 * Custom Hook para gestionar bases de datos locales indexadas con Dexie.js (IndexedDB).
 * Proporciona soporte offline-first y reactividad en tiempo real mediante useLiveQuery.
 */
export function useDexie<T = any>(
  table: string,
  filterFn: ((item: T) => boolean) | null = null
) {
  const [manualResults, setManualResults] = useState<T[]>([]);
  const [isPending, setIsPending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Escucha en tiempo real sobre db[table] con useLiveQuery
  const liveResults = useLiveQuery(
    async () => {
      try {
        const tableInstance = (dexieDb as any)[table];
        if (!tableInstance) return [];
        const all: T[] = await tableInstance.toArray();
        return filterFn ? all.filter(filterFn) : all;
      } catch (err: any) {
        console.warn(`[useDexie] Error en useLiveQuery sobre ${table}:`, err);
        return [];
      }
    },
    [table, filterFn]
  );

  /**
   * getAll(): Lectura manual puntual sobre db[table]
   */
  const getAll = useCallback(async (): Promise<T[]> => {
    setIsPending(true);
    setError(null);
    try {
      const tableInstance = (dexieDb as any)[table];
      if (!tableInstance) {
        throw new Error(`La tabla "${table}" no existe en Dexie MiAppDB`);
      }
      const all: T[] = await tableInstance.toArray();
      const filtered = filterFn ? all.filter(filterFn) : all;
      setManualResults(filtered);
      setIsPending(false);
      return filtered;
    } catch (err: any) {
      setError(err?.message || 'Error al obtener registros de Dexie');
      setIsPending(false);
      return [];
    }
  }, [table, filterFn]);

  /**
   * add(data): Inserta un registro añadiendo marca temporal createdAt
   */
  const add = useCallback(async (data: Partial<T>): Promise<any> => {
    setIsPending(true);
    setError(null);
    try {
      const tableInstance = (dexieDb as any)[table];
      if (!tableInstance) {
        throw new Error(`La tabla "${table}" no existe en Dexie`);
      }
      const id = await tableInstance.add({
        ...data,
        createdAt: new Date().toISOString()
      });
      setIsPending(false);
      return id;
    } catch (err: any) {
      setError(err?.message || 'Error al agregar registro en Dexie');
      setIsPending(false);
      throw err;
    }
  }, [table]);

  /**
   * update(id, data): Actualiza un registro por su clave primaria
   */
  const update = useCallback(async (id: any, data: Partial<T>): Promise<void> => {
    setIsPending(true);
    setError(null);
    try {
      const tableInstance = (dexieDb as any)[table];
      if (!tableInstance) {
        throw new Error(`La tabla "${table}" no existe en Dexie`);
      }
      await tableInstance.update(id, {
        ...data,
        updatedAt: new Date().toISOString()
      });
      setIsPending(false);
    } catch (err: any) {
      setError(err?.message || 'Error al actualizar registro en Dexie');
      setIsPending(false);
      throw err;
    }
  }, [table]);

  /**
   * deleteItem(id): Elimina un registro por id
   */
  const deleteItem = useCallback(async (id: any): Promise<void> => {
    setIsPending(true);
    setError(null);
    try {
      const tableInstance = (dexieDb as any)[table];
      if (!tableInstance) {
        throw new Error(`La tabla "${table}" no existe en Dexie`);
      }
      await tableInstance.delete(id);
      setIsPending(false);
    } catch (err: any) {
      setError(err?.message || 'Error al eliminar registro en Dexie');
      setIsPending(false);
      throw err;
    }
  }, [table]);

  return {
    liveResults: liveResults ?? [],
    manualResults,
    results: (liveResults ?? manualResults ?? []) as T[],
    isPending,
    error,
    getAll,
    add,
    update,
    deleteItem
  };
}
