// src/types/contact.ts

/**
 * Modelo de datos de un Contacto para Cloud Firestore
 */
export interface Contact {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  createdAt?: any;
  updatedAt?: any;
}
