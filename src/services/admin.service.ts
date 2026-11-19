import { collection, deleteDoc, doc, getCountFromServer, onSnapshot, query, where } from 'firebase/firestore';
import { db, toIso } from '../lib/firebase';
import type { Report } from '../types';

export interface AdminStats {
  users: number;
  posts: number;
  businesses: number;
  pendingBusinesses: number;
}

/** Conteos agregados en el servidor (no descarga los documentos). */
export async function fetchStats(): Promise<AdminStats> {
  const [users, posts, businesses, pending] = await Promise.all([
    getCountFromServer(collection(db, 'users')),
    getCountFromServer(collection(db, 'posts')),
    getCountFromServer(collection(db, 'businesses')),
    getCountFromServer(query(collection(db, 'businesses'), where('verified', '==', false)))
  ]);
  return {
    users: users.data().count,
    posts: posts.data().count,
    businesses: businesses.data().count,
    pendingBusinesses: pending.data().count
  };
}

export function subscribeReports(onChange: (list: Report[]) => void, onError: (e: Error) => void) {
  return onSnapshot(
    collection(db, 'reports'),
    (snap) =>
      onChange(
        snap.docs
          .map((d) => {
            const x = d.data({ serverTimestamps: 'estimate' });
            return {
              id: d.id,
              postId: x.postId,
              postExcerpt: x.postExcerpt ?? '',
              postAuthor: x.postAuthor ?? '',
              reporterId: x.reporterId,
              reason: x.reason ?? '',
              createdAt: toIso(x.createdAt)
            };
          })
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      ),
    onError
  );
}

export const dismissReport = (id: string) => deleteDoc(doc(db, 'reports', id));

/** Elimina la publicacion reportada y luego el reporte. */
export async function removeReportedPost(report: Report): Promise<void> {
  await deleteDoc(doc(db, 'posts', report.postId)).catch(() => undefined);
  await deleteDoc(doc(db, 'reports', report.id));
}
