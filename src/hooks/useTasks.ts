// src/hooks/useTasks.ts
import { useState, useEffect, useCallback } from 'react';
import { Task } from '../types/task';

// Generador de tareas iniciales asociadas al usuario actual
const createInitialTasks = (userId: string): Task[] => [
  {
    id: 'task-1-' + userId,
    userId,
    title: 'Instalar Ionic React y configurar Vite',
    description: 'Configuracion inicial del entorno de desarrollo movil y soporte de componentes nativos.',
    completed: true,
    category: 'Configuracion',
    date: '2026-10-01',
    createdAt: Date.now() - 400000000,
  },
  {
    id: 'task-2-' + userId,
    userId,
    title: 'Crear componentes TaskForm, TaskList y TaskItem',
    description: 'Modularizacion de la interfaz grafica utilizando IonCard, IonCheckbox y estilos responsivos.',
    completed: true,
    category: 'Frontend',
    date: '2026-10-03',
    createdAt: Date.now() - 300000000,
  },
  {
    id: 'task-3-' + userId,
    userId,
    title: 'Implementar autenticacion con Firebase Auth',
    description: 'Integrar login, registro, logout y persistencia de sesion mediante el SDK modular de Firebase.',
    completed: true,
    category: 'Backend',
    date: '2026-10-06',
    createdAt: Date.now() - 200000000,
  },
  {
    id: 'task-4-' + userId,
    userId,
    title: 'Estructurar Context API (AuthContext y TasksContext)',
    description: 'Desacoplar la logica en Custom Hooks y evitar prop drilling siguiendo las diapositivas de clase.',
    completed: false,
    category: 'Arquitectura',
    date: '2026-10-08',
    createdAt: Date.now() - 100000000,
  },
  {
    id: 'task-5-' + userId,
    userId,
    title: 'Generar rutas protegidas y validar en dispositivo movil',
    description: 'Garantizar que usuarios no autenticados sean redirigidos a /login y compilar con Capacitor.',
    completed: false,
    category: 'Movil',
    date: '2026-10-10',
    createdAt: Date.now(),
  },
];

/**
 * Custom Hook que encapsula todas las operaciones CRUD y persistencia de Tareas
 * Aislado por cada usuario para evitar que se compartan tareas entre cuentas distintas.
 */
export function useTasks(userId?: string) {
  const currentUid = userId || 'guest';
  const storageKey = `challenge05_tasks_${currentUid}`;

  const loadTasksFromStorage = useCallback((uid: string): Task[] => {
    const key = `challenge05_tasks_${uid}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        console.error('Error al parsear tareas de localStorage:', e);
      }
    }
    // Si no tiene tareas guardadas todavia, creamos su lista inicial personalizada
    const initial = createInitialTasks(uid);
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }, []);

  const [tasks, setTasks] = useState<Task[]>(() => loadTasksFromStorage(currentUid));

  // Sincronizar tareas cuando el usuario cambia (inicia sesion otro usuario o cierra sesion)
  useEffect(() => {
    setTasks(loadTasksFromStorage(currentUid));
  }, [currentUid, loadTasksFromStorage]);

  // Persistir en localStorage especifico del usuario activo cada vez que cambien sus tareas
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(tasks));
  }, [tasks, storageKey]);

  /**
   * Agrega una nueva tarea vinculada exclusivamente al usuario actual
   */
  const addTask = useCallback(
    (taskData: Omit<Task, 'id' | 'createdAt' | 'userId'>) => {
      const newTask: Task = {
        ...taskData,
        id: 'task_' + Date.now(),
        userId: currentUid,
        createdAt: Date.now(),
      };
      setTasks((prev) => [newTask, ...prev]);
      return newTask;
    },
    [currentUid]
  );

  /**
   * Actualiza una tarea existente por su ID
   */
  const updateTask = useCallback(
    (id: string, updatedFields: Partial<Omit<Task, 'id' | 'createdAt' | 'userId'>>) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updatedFields } : t))
      );
    },
    []
  );

  /**
   * Elimina una tarea por su ID
   */
  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /**
   * Alterna el estado completado / pendiente
   */
  const toggleTaskStatus = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }, []);

  /**
   * Obtiene una tarea especifica por su ID
   */
  const getTaskById = useCallback(
    (id: string): Task | undefined => {
      return tasks.find((t) => t.id === id);
    },
    [tasks]
  );

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    getTaskById,
  };
}
