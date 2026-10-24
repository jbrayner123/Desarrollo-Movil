// src/db/db.ts
import Dexie, { Table } from 'dexie';

/**
 * Modelo de datos para la entidad Fruta en Dexie (IndexedDB)
 */
export interface Fruta {
  id?: number;
  nombre: string;
  proveedor: string;
  fechaCosecha: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Clase de base de datos Dexie con tipado y esquemas versionados
 */
export class MiAppDatabase extends Dexie {
  frutas!: Table<Fruta, number>;

  constructor() {
    super('MiAppDB');
    this.version(1).stores({
      frutas: '++id, nombre, proveedor, fechaCosecha, createdAt'
    });
  }
}

// Instancia única exportada de Dexie
export const db = new MiAppDatabase();
export const dexieDb = db;
