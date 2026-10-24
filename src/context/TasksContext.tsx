// src/context/TasksContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { useTasks } from '../hooks/useTasks';
import { useAuthContext } from './AuthContext';
import { Task } from '../types/task';

export interface TasksContextType {
  tasks: Task[];
  isPending?: boolean;
  error?: string | null;
  addTask: (data: Omit<Task, 'id' | 'createdAt' | 'userId'>) => Promise<Task> | Task;
  updateTask: (id: string, updatedFields: Partial<Omit<Task, 'id' | 'createdAt' | 'userId'>>) => Promise<void> | void;
  deleteTask: (id: string) => Promise<void> | void;
  toggleTaskStatus: (id: string) => Promise<void> | void;
  getTaskById: (id: string) => Task | undefined;
}

// 1. Creacion del contexto de Tareas
export const TasksContext = createContext<TasksContextType | undefined>(undefined);

interface TasksProviderProps {
  children: ReactNode;
}

/**
 * Proveedor de Tareas que envuelve las paginas de la aplicacion
 * Permite que cada usuario maneje sus propias tareas aisladas sin compartirlas con otros usuarios.
 */
export const TasksProvider: React.FC<TasksProviderProps> = ({ children }) => {
  const { user } = useAuthContext();
  const tasksOperations = useTasks(user?.uid);

  return (
    <TasksContext.Provider value={tasksOperations}>
      {children}
    </TasksContext.Provider>
  );
};

/**
 * Hook de conveniencia para consumir TasksContext
 */
export const useTasksContext = (): TasksContextType => {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error('useTasksContext debe ser utilizado dentro de un TasksProvider');
  }
  return context;
};
