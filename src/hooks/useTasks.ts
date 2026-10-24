// src/hooks/useTasks.ts
import { useCallback } from 'react';
import { Task } from '../types/task';
import { useRealTimeCollection } from './useRealTimeCollection';

/**
 * Custom Hook useTasks adaptado para el Challenge 06.
 * Migrado para operar 100% sobre Firebase Realtime Database mediante useRealTimeCollection('tasks').
 */
export function useTasks(userId?: string) {
  const {
    results,
    isPending,
    error,
    getAll,
    add,
    update,
    deleteDoc
  } = useRealTimeCollection<Task>('tasks');

  // Filtrado opcional por usuario si se especifica, o todas las tareas
  const tasks = userId
    ? results.filter((t) => !t.userId || t.userId === userId)
    : results;

  /**
   * Agrega una nueva tarea a Realtime Database con push()
   */
  const addTask = useCallback(
    async (taskData: Omit<Task, 'id' | 'createdAt' | 'userId'>) => {
      const payload = {
        ...taskData,
        userId: userId || 'anonymous',
        completed: false
      };
      const newKey = await add(payload);
      return {
        id: newKey,
        ...payload,
        createdAt: new Date().toISOString()
      } as Task;
    },
    [add, userId]
  );

  /**
   * Actualiza una tarea existente por su ID en Realtime Database con set()
   */
  const updateTask = useCallback(
    async (id: string, updatedFields: Partial<Omit<Task, 'id' | 'createdAt' | 'userId'>>) => {
      const existing = results.find((t) => t.id === id);
      const payload = {
        ...(existing || {}),
        ...updatedFields
      };
      await update(id, payload);
    },
    [update, results]
  );

  /**
   * Elimina una tarea por su ID en Realtime Database con remove()
   */
  const deleteTask = useCallback(
    async (id: string) => {
      await deleteDoc(id);
    },
    [deleteDoc]
  );

  /**
   * Alterna el estado completado/pendiente de una tarea en tiempo real
   */
  const toggleTaskStatus = useCallback(
    async (id: string) => {
      const task = results.find((t) => t.id === id);
      if (task) {
        await update(id, {
          ...task,
          completed: !task.completed
        });
      }
    },
    [results, update]
  );

  /**
   * Obtiene una tarea especifica por su ID
   */
  const getTaskById = useCallback(
    (id: string): Task | undefined => {
      return results.find((t) => t.id === id);
    },
    [results]
  );

  return {
    tasks,
    isPending,
    error,
    getAll,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    getTaskById
  };
}
