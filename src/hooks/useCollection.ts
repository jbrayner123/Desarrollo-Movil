// src/hooks/useCollection.ts
import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  WhereFilterOp,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '../firebase/config';

export type FilterTuple = [string, WhereFilterOp, any];
export type FilterObject = { field: string; op: WhereFilterOp; value: any };
export type FilterItem = FilterTuple | FilterObject;

/**
 * Custom Hook para gestionar colecciones de Firebase Cloud Firestore.
 * Satisface los requerimientos de la asignatura para el módulo de Contactos.
 */
export function useCollection<T = any>(table: string) {
  const [results, setResults] = useState<T[]>([]);
  const [isPending, setIsPending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fallback local key si Firebase está en modo demo/placeholder
  const fallbackKey = `challenge06_firestore_${table}`;

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

  /**
   * Obtiene todos los documentos de la colección aplicando filtros opcionales
   */
  const getAll = useCallback(async (filters: FilterItem[] = []): Promise<T[]> => {
    setIsPending(true);
    setError(null);

    const isPlaceholder = db.app.options.apiKey?.includes('Placeholder');

    try {
      if (isPlaceholder) {
        let items = loadFallback();
        // Si no hay datos iniciales de demo en contactos, inicializamos con ejemplos
        if (items.length === 0 && table === 'contacts') {
          items = [
            {
              id: 'c1',
              name: 'Ing. Carlos Mendoza',
              phone: '+57 310 456 7890',
              email: 'carlos.mendoza@telecom.co',
              notes: 'Docente Plataformas Móviles'
            } as unknown as T,
            {
              id: 'c2',
              name: 'Dra. Elena Ramos',
              phone: '+57 315 987 6543',
              email: 'elena.ramos@investigacion.org',
              notes: 'Coordinadora de Semillero'
            } as unknown as T
          ];
          saveFallback(items);
        }
        setResults(items);
        setIsPending(false);
        return items;
      }

      // Consulta en Firebase Cloud Firestore
      const constraints: QueryConstraint[] = (filters || []).map((f) => {
        if (Array.isArray(f)) {
          return where(f[0], f[1], f[2]);
        }
        return where(f.field, f.op, f.value);
      });

      const collRef = collection(db, table);
      const q = constraints.length > 0 ? query(collRef, ...constraints) : query(collRef);
      const querySnapshot = await getDocs(q);

      const items: T[] = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      })) as unknown as T[];

      setResults(items);
      setIsPending(false);
      return items;
    } catch (err: any) {
      console.warn(`[useCollection] Error al consultar Firestore (${table}):`, err);
      // Respaldo en caso de error de conexión / credenciales
      const fallbackItems = loadFallback();
      setResults(fallbackItems);
      setError(err?.message || 'Error al obtener datos de Firestore');
      setIsPending(false);
      return fallbackItems;
    }
  }, [table, loadFallback, saveFallback]);

  /**
   * Agrega un nuevo documento a la colección con createdAt: serverTimestamp()
   */
  const add = useCallback(async (data: Record<string, any>): Promise<string> => {
    setIsPending(true);
    setError(null);

    const isPlaceholder = db.app.options.apiKey?.includes('Placeholder');

    try {
      if (isPlaceholder) {
        const id = 'mock-' + Date.now();
        const newItem = {
          id,
          ...data,
          createdAt: new Date().toISOString()
        } as unknown as T;
        const current = loadFallback();
        const updated = [newItem, ...current];
        saveFallback(updated);
        setResults(updated);
        setIsPending(false);
        return id;
      }

      const collRef = collection(db, table);
      const docRef = await addDoc(collRef, {
        ...data,
        createdAt: serverTimestamp()
      });

      await getAll();
      setIsPending(false);
      return docRef.id;
    } catch (err: any) {
      console.warn(`[useCollection] Fallback al agregar en ${table}:`, err);
      const id = 'local-' + Date.now();
      const newItem = {
        id,
        ...data,
        createdAt: new Date().toISOString()
      } as unknown as T;
      const current = loadFallback();
      const updated = [newItem, ...current];
      saveFallback(updated);
      setResults(updated);
      setError(err?.message || 'Error al guardar en Firestore');
      setIsPending(false);
      return id;
    }
  }, [table, getAll, loadFallback, saveFallback]);

  /**
   * Actualiza un documento existente por id con updatedAt: serverTimestamp()
   */
  const update = useCallback(async (id: string, data: Record<string, any>): Promise<void> => {
    setIsPending(true);
    setError(null);

    const isPlaceholder = db.app.options.apiKey?.includes('Placeholder');

    try {
      if (isPlaceholder) {
        const current = loadFallback();
        const updated = current.map((item: any) =>
          item.id === id ? { ...item, ...data, updatedAt: new Date().toISOString() } : item
        );
        saveFallback(updated);
        setResults(updated);
        setIsPending(false);
        return;
      }

      const docRef = doc(db, table, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });

      await getAll();
      setIsPending(false);
    } catch (err: any) {
      console.warn(`[useCollection] Fallback al actualizar en ${table}:`, err);
      const current = loadFallback();
      const updated = current.map((item: any) =>
        item.id === id ? { ...item, ...data, updatedAt: new Date().toISOString() } : item
      );
      saveFallback(updated);
      setResults(updated);
      setError(err?.message || 'Error al actualizar documento en Firestore');
      setIsPending(false);
    }
  }, [table, getAll, loadFallback, saveFallback]);

  /**
   * Elimina un documento por id de Cloud Firestore
   */
  const remove = useCallback(async (id: string): Promise<void> => {
    setIsPending(true);
    setError(null);

    const isPlaceholder = db.app.options.apiKey?.includes('Placeholder');

    try {
      if (isPlaceholder) {
        const current = loadFallback();
        const updated = current.filter((item: any) => item.id !== id);
        saveFallback(updated);
        setResults(updated);
        setIsPending(false);
        return;
      }

      const docRef = doc(db, table, id);
      await deleteDoc(docRef);

      await getAll();
      setIsPending(false);
    } catch (err: any) {
      console.warn(`[useCollection] Fallback al eliminar en ${table}:`, err);
      const current = loadFallback();
      const updated = current.filter((item: any) => item.id !== id);
      saveFallback(updated);
      setResults(updated);
      setError(err?.message || 'Error al eliminar documento en Firestore');
      setIsPending(false);
    }
  }, [table, getAll, loadFallback, saveFallback]);

  // Carga automática inicial al montar el hook
  useEffect(() => {
    getAll();
  }, [getAll]);

  return {
    results,
    isPending,
    error,
    getAll,
    add,
    update,
    remove
  };
}
