// src/hooks/useRealTimeCollection.ts
import { useState, useEffect, useCallback } from 'react';
import {
  ref,
  onValue,
  get,
  push,
  set,
  remove
} from 'firebase/database';
import { rtdb } from '../firebase/config';

/**
 * Custom Hook para gestionar colecciones en tiempo real mediante Firebase Realtime Database.
 * Satisface los requerimientos de la asignatura para el módulo de Tareas (Tasks).
 */
export function useRealTimeCollection<T = any>(table: string) {
  const [results, setResults] = useState<T[]>([]);
  const [isPending, setIsPending] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fallback de persistencia local si Firebase se ejecuta en modo demo/placeholder
  const fallbackKey = `challenge06_rtdb_${table}`;

  const loadFallback = useCallback((): T[] => {
    try {
      const stored = localStorage.getItem(fallbackKey);
      if (stored) return JSON.parse(stored);
    } catch {
      // Ignorar error de parsing
    }
    return [];
  }, [fallbackKey]);

  const saveFallback = useCallback((items: T[]) => {
    try {
      localStorage.setItem(fallbackKey, JSON.stringify(items));
    } catch {
      // Ignorar error de almacenamiento
    }
  }, [fallbackKey]);

  // Escucha reactiva en tiempo real con onValue
  useEffect(() => {
    const isPlaceholder = rtdb.app.options.apiKey?.includes('Placeholder');

    if (isPlaceholder) {
      let items = loadFallback();
      if (items.length === 0 && table === 'tasks') {
        items = [
          {
            id: 'task-101',
            title: 'Configurar Firebase Realtime Database',
            description: 'Verificar la conexion y sincronizacion bidireccional en tiempo real.',
            completed: true,
            category: 'Estudio',
            date: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString()
          } as unknown as T,
          {
            id: 'task-102',
            title: 'Integrar Dexie IndexedDB para Frutas',
            description: 'Garantizar funcionamiento offline con useLiveQuery y versionado de esquema.',
            completed: false,
            category: 'Trabajo',
            date: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString()
          } as unknown as T
        ];
        saveFallback(items);
      }
      setResults(items);
      setIsPending(false);
      return;
    }

    const tableRef = ref(rtdb, table);

    const unsubscribe = onValue(
      tableRef,
      (snapshot) => {
        setIsPending(false);
        setError(null);
        if (snapshot.exists() && snapshot.val()) {
          const val = snapshot.val();
          const items: T[] = Object.entries(val).map(([id, value]) => ({
            id,
            ...(typeof value === 'object' && value !== null ? value : {})
          })) as unknown as T[];
          setResults(items);
          saveFallback(items);
        } else {
          setResults([]);
        }
      },
      (err) => {
        console.warn(`[useRealTimeCollection] Error en onValue para ${table}:`, err);
        setError(err.message);
        setIsPending(false);
        setResults(loadFallback());
      }
    );

    return () => {
      unsubscribe();
    };
  }, [table, loadFallback, saveFallback]);

  /**
   * getAll(): Lectura puntual con get(ref(rtdb, table))
   */
  const getAll = useCallback(async (): Promise<T[]> => {
    setIsPending(true);
    setError(null);

    const isPlaceholder = rtdb.app.options.apiKey?.includes('Placeholder');

    try {
      if (isPlaceholder) {
        const items = loadFallback();
        setResults(items);
        setIsPending(false);
        return items;
      }

      const snapshot = await get(ref(rtdb, table));
      if (snapshot.exists() && snapshot.val()) {
        const val = snapshot.val();
        const items: T[] = Object.entries(val).map(([id, value]) => ({
          id,
          ...(typeof value === 'object' && value !== null ? value : {})
        })) as unknown as T[];
        setResults(items);
        saveFallback(items);
        setIsPending(false);
        return items;
      }
      setResults([]);
      setIsPending(false);
      return [];
    } catch (err: any) {
      console.warn(`[useRealTimeCollection] Error en getAll (${table}):`, err);
      const items = loadFallback();
      setResults(items);
      setError(err?.message || 'Error al obtener datos de Realtime Database');
      setIsPending(false);
      return items;
    }
  }, [table, loadFallback, saveFallback]);

  /**
   * add(data): Usa push(ref(rtdb, table), { ...data, createdAt: new Date().toISOString() })
   */
  const add = useCallback(async (data: Record<string, any>): Promise<string> => {
    setIsPending(true);
    setError(null);

    const isPlaceholder = rtdb.app.options.apiKey?.includes('Placeholder');
    const payload = {
      ...data,
      createdAt: new Date().toISOString()
    };

    try {
      if (isPlaceholder) {
        const id = 'task-rtdb-' + Date.now();
        const newItem = { id, ...payload } as unknown as T;
        const current = loadFallback();
        const updated = [newItem, ...current];
        saveFallback(updated);
        setResults(updated);
        setIsPending(false);
        return id;
      }

      const tableRef = ref(rtdb, table);
      const newRef = await push(tableRef, payload);
      setIsPending(false);
      return newRef.key || '';
    } catch (err: any) {
      console.warn(`[useRealTimeCollection] Fallback al agregar en ${table}:`, err);
      const id = 'local-rtdb-' + Date.now();
      const newItem = { id, ...payload } as unknown as T;
      const current = loadFallback();
      const updated = [newItem, ...current];
      saveFallback(updated);
      setResults(updated);
      setError(err?.message || 'Error al insertar en Realtime Database');
      setIsPending(false);
      return id;
    }
  }, [table, loadFallback, saveFallback]);

  /**
   * update(id, data): Usa set(ref(rtdb, `${table}/${id}`), { ...data, updatedAt: new Date().toISOString() })
   */
  const update = useCallback(async (id: string, data: Record<string, any>): Promise<void> => {
    setIsPending(true);
    setError(null);

    const isPlaceholder = rtdb.app.options.apiKey?.includes('Placeholder');
    const payload = {
      ...data,
      updatedAt: new Date().toISOString()
    };

    try {
      if (isPlaceholder) {
        const current = loadFallback();
        const updated = current.map((item: any) =>
          item.id === id ? { ...item, ...payload } : item
        );
        saveFallback(updated);
        setResults(updated);
        setIsPending(false);
        return;
      }

      const itemRef = ref(rtdb, `${table}/${id}`);
      await set(itemRef, payload);
      setIsPending(false);
    } catch (err: any) {
      console.warn(`[useRealTimeCollection] Fallback al actualizar en ${table}:`, err);
      const current = loadFallback();
      const updated = current.map((item: any) =>
        item.id === id ? { ...item, ...payload } : item
      );
      saveFallback(updated);
      setResults(updated);
      setError(err?.message || 'Error al actualizar en Realtime Database');
      setIsPending(false);
    }
  }, [table, loadFallback, saveFallback]);

  /**
   * deleteDoc(id): Usa remove(ref(rtdb, `${table}/${id}`))
   */
  const deleteDoc = useCallback(async (id: string): Promise<void> => {
    setIsPending(true);
    setError(null);

    const isPlaceholder = rtdb.app.options.apiKey?.includes('Placeholder');

    try {
      if (isPlaceholder) {
        const current = loadFallback();
        const updated = current.filter((item: any) => item.id !== id);
        saveFallback(updated);
        setResults(updated);
        setIsPending(false);
        return;
      }

      const itemRef = ref(rtdb, `${table}/${id}`);
      await remove(itemRef);
      setIsPending(false);
    } catch (err: any) {
      console.warn(`[useRealTimeCollection] Fallback al eliminar en ${table}:`, err);
      const current = loadFallback();
      const updated = current.filter((item: any) => item.id !== id);
      saveFallback(updated);
      setResults(updated);
      setError(err?.message || 'Error al eliminar en Realtime Database');
      setIsPending(false);
    }
  }, [table, loadFallback, saveFallback]);

  return {
    results,
    isPending,
    error,
    getAll,
    add,
    update,
    deleteDoc
  };
}
