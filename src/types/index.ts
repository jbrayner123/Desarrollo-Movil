export interface Tarea {
  id: number;
  titulo: string;
  completada: boolean;
  user_id: string;
  created_at: string;
}

export interface UserMetadata {
  nombre?: string;
  avatar_url?: string;
}
