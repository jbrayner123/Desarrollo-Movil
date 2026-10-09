// src/types/task.ts

/**
 * Modelo de datos de una Tarea (Task)
 * Cumple con los requerimientos de la asignatura Desarrollo Móvil
 */
export interface Task {
  id: string;               // Identificador único de la tarea (UUID o timestamp)
  title: string;            // Título principal de la tarea
  description: string;      // Detalle o descripción ampliada
  completed: boolean;       // Estado: true (Completada), false (Pendiente)
  category: string;         // Categoría: Ej. 'Estudio', 'Trabajo', 'Personal', 'Salud'
  date: string;             // Fecha de la tarea (YYYY-MM-DD)
  createdAt: number;        // Marca temporal de creación en milisegundos
}
