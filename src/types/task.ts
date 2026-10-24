// src/types/task.ts

/**
 * Modelo de datos de una Tarea (Task) para Firebase Realtime Database
 * Challenge 06: Soporta identificador dinamico de RTDB y marcas temporales ISO
 */
export interface Task {
  id: string;               // Identificador unico generado por push() o manual
  userId?: string;          // Identificador opcional del usuario creador
  title: string;            // Titulo principal de la tarea
  description: string;      // Detalle o descripcion ampliada
  completed: boolean;       // Estado: true (Completada), false (Pendiente)
  category: string;         // Categoria: Ej. 'Estudio', 'Trabajo', 'Personal', 'Salud'
  date: string;             // Fecha de la tarea (YYYY-MM-DD)
  createdAt?: string | number; // Marca temporal de creacion
  updatedAt?: string | number; // Marca temporal de actualizacion
}

