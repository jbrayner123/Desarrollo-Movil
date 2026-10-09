// src/hooks/useTasks.ts
import { useState, useEffect, useCallback } from 'react';
import { Task } from '../types/task';

const TASKS_STORAGE_KEY = 'challenge05_tasks_list';

// Tareas iniciales por defecto (heredadas y enriquecidas desde el Reto 3)
const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Instalar Ionic React y configurar Vite',
    description: 'Configuración inicial del entorno de desarrollo móvil y soporte de componentes web nativos.',
    completed: true,
    category: 'Configuración',
    date: '2026-10-01',
    createdAt: Date.now() - 400000000,
  },
  {
    id: 'task-2',
    title: 'Crear componentes TaskForm, TaskList y TaskItem',
    description: 'Modularización de la interfaz gráfica utilizando IonCard, IonCheckbox y estilos responsivos.',
    completed: true,
    category: 'Frontend',
    date: '2026-10-03',
    createdAt: Date.now() - 300000000,
  },
  {
    id: 'task-3',
    title: 'Implementar autenticación con Firebase Auth',
    description: 'Integrar login, registro, logout y persistencia de sesión mediante el SDK modular de Firebase.',
    completed: true,
    category: 'Backend',
    date: '2026-10-06',
    createdAt: Date.now() - 200000000,
  },
  {
    id: 'task-4',
    title: 'Estructurar Context API (AuthContext y TasksContext)',
    description: 'Desacoplar la lógica en Custom Hooks y evitar prop drilling siguiendo las diapositivas de clase.',
    completed: false,
    category: 'Arquitectura',
    date: '2026-10-08',
    createdAt: Date.now() - 100000000,
  },
  {
    id: 'task-5',
    title: 'Generar rutas protegidas y validar en dispositivo móvil',
    description: 'Garantizar que usuarios no autenticados sean redirigidos a /login y compilar con Capacitor.',
    completed: false,
    category: 'Móvil',
    date: '2026-10-10',
    createdAt: Date.now(),
  },
];

/**
 * Custom Hook que encapsula todas las operaciones CRUD y persistencia de Tareas
 */
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    // 1. Cargar desde localStorage o usar las tareas iniciales
    const stored = localStorage.getItem(TASKS_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Error al parsear tareas de localStorage:', e);
      }
    }
    return INITIAL_TASKS;
  });

  // 2. Persistir en localStorage cada vez que la lista de tareas cambia
  useEffect(() => {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  /**
   * Agrega una nueva tarea a la lista
   */
  const addTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: 'task_' + Date.now(),
      createdAt: Date.now(),
    };
    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  }, []);

  /**
   * Actualiza una tarea existente por su ID
   */
  const updateTask = useCallback((id: string, updatedFields: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updatedFields } : t))
    );
  }, []);

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
   * Obtiene una tarea específica por su ID
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
