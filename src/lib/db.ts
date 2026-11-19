import Dexie, { type EntityTable } from 'dexie';
import type { Post, PostCategory, PostLocation } from '../types';

/**
 * Base de datos local (IndexedDB con Dexie) para funcionar sin conexion:
 * - cachedPosts: ultimas publicaciones del feed, visibles aunque no haya red.
 * - drafts: borradores de publicaciones creados sin conexion, para publicar despues.
 */

export interface Draft {
  id?: number;
  category: PostCategory;
  text: string;
  petName?: string;
  /** Foto en data URL: se sube a Cloudinary al publicar el borrador. */
  imageDataUrl?: string;
  location?: PostLocation;
  createdAt: string;
}

export const localDb = new Dexie('manada') as Dexie & {
  cachedPosts: EntityTable<Post, 'id'>;
  drafts: EntityTable<Draft, 'id'>;
};

localDb.version(1).stores({
  cachedPosts: 'id, createdAt, category',
  drafts: '++id, createdAt'
});

/** Reemplaza la cache del feed con las publicaciones mas recientes. */
export async function cacheFeed(posts: Post[]): Promise<void> {
  await localDb.transaction('rw', localDb.cachedPosts, async () => {
    await localDb.cachedPosts.clear();
    await localDb.cachedPosts.bulkPut(posts.slice(0, 50));
  });
}
