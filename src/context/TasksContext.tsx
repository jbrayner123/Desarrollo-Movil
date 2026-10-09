// src/context/TasksContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { useTasks } from '../hooks/useTasks';
import { Task } from '../types/task';

export interface TasksContextType {
  tasks: Task[];
  addTask: (data: Omit<Task, 'id' | 'createdAt'>) => Task;
  updateTask: (id: string, updatedFields: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;
  getTaskById: (id: string) => Task | undefined;
}

// 1. Creación del contexto de Tareas
export const TasksContext = createContext<TasksContextType | undefined>(undefined);

interface TasksProviderProps {
  children: ReactNode;
}

/**
 * Proveedor de Tareas que envuelve las páginas de la aplicación
 * Permite que cualquier componente acceda y modifique el listado sin prop drilling.
 */
export const TasksProvider: React.FC<TasksProviderProps> = ({ children }) => {
  const tasksOperations = useTasks();

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
