// src/types/task.ts

/**
 * Modelo de datos de una Tarea (Task)
 * Cumple con los requerimientos de la asignatura Desarrollo Movil
 */
export interface Task {
  id: string;               // Identificador unico de la tarea (UUID o timestamp)
  userId: string;           // Identificador del usuario propietario de la tarea
  title: string;            // Titulo principal de la tarea
  description: string;      // Detalle o descripcion ampliada
  completed: boolean;       // Estado: true (Completada), false (Pendiente)
  category: string;         // Categoria: Ej. 'Estudio', 'Trabajo', 'Personal', 'Salud'
  date: string;             // Fecha de la tarea (YYYY-MM-DD)
  createdAt: number;        // Marca temporal de creacion en milisegundos
}
