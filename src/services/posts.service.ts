import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
  writeBatch
} from 'firebase/firestore';
import { db, toIso } from '../lib/firebase';
import type { Comment, Post, PostCategory, PostLocation, Role, UserProfile } from '../types';

export interface NewPostInput {
  category: PostCategory;
  text: string;
  petName?: string;
  imageUrl?: string;
  location?: PostLocation;
}

const posts = collection(db, 'posts');
const FEED_SIZE = 50;

function mapPost(id: string, x: Record<string, unknown>): Post {
  return {
    id,
    authorId: x.authorId as string,
    authorName: (x.authorName as string) ?? '',
    authorPhoto: (x.authorPhoto as string) ?? '',
    authorRole: (x.authorRole as Role) ?? 'owner',
    category: (x.category as PostCategory) ?? 'tip',
    text: (x.text as string) ?? '',
    petName: (x.petName as string) || undefined,
    imageUrl: (x.imageUrl as string) || undefined,
    location: (x.location as PostLocation) || undefined,
    likesCount: (x.likesCount as number) ?? 0,
    commentsCount: (x.commentsCount as number) ?? 0,
    createdAt: toIso(x.createdAt)
  };
}

/** Feed en tiempo real: las 50 publicaciones mas recientes. */
export function subscribeFeed(onChange: (list: Post[], fromCache: boolean) => void, onError: (e: Error) => void) {
  return onSnapshot(
    query(posts, orderBy('createdAt', 'desc'), limit(FEED_SIZE)),
    { includeMetadataChanges: false },
    (snap) => onChange(snap.docs.map((d) => mapPost(d.id, d.data({ serverTimestamps: 'estimate' }))), snap.metadata.fromCache),
    onError
  );
}

/** Mascotas perdidas y paseos con ubicacion, para el mapa. */
export function subscribeMapPosts(onChange: (list: Post[]) => void, onError: (e: Error) => void) {
  return onSnapshot(
    query(posts, where('category', 'in', ['perdido', 'paseo'])),
    (snap) => onChange(snap.docs.map((d) => mapPost(d.id, d.data({ serverTimestamps: 'estimate' }))).filter((p) => p.location)),
    onError
  );
}

export async function createPost(author: UserProfile, input: NewPostInput, authorName: string, authorPhoto: string): Promise<string> {
  const data: Record<string, unknown> = {
    authorId: author.uid,
    authorName,
    authorPhoto,
    authorRole: author.role,
    category: input.category,
    text: input.text.trim(),
    likesCount: 0,
    commentsCount: 0,
    createdAt: serverTimestamp()
  };
  if (input.petName) data.petName = input.petName.trim();
  if (input.imageUrl) data.imageUrl = input.imageUrl;
  if (input.location) data.location = input.location;
  const ref = await addDoc(posts, data);
  return ref.id;
}

export const deletePost = (postId: string) => deleteDoc(doc(db, 'posts', postId));

// ---- Me gusta ----------------------------------------------------------------------

/** IDs de las publicaciones que le gustan al usuario, en vivo. */
export function subscribeMyLikes(postIds: string[], uid: string, onChange: (liked: Set<string>) => void) {
  // Una suscripcion por publicacion visible al documento likes/{uid}.
  const liked = new Set<string>();
  const unsubs = postIds.map((id) =>
    onSnapshot(
      doc(db, 'posts', id, 'likes', uid),
      (snap) => {
        if (snap.exists()) liked.add(id);
        else liked.delete(id);
        onChange(new Set(liked));
      },
      () => undefined
    )
  );
  return () => unsubs.forEach((u) => u());
}

/** Marca o desmarca el me gusta y ajusta el contador en la misma operacion. */
export async function setLike(postId: string, uid: string, like: boolean): Promise<void> {
  const batch = writeBatch(db);
  const likeRef = doc(db, 'posts', postId, 'likes', uid);
  if (like) batch.set(likeRef, { createdAt: serverTimestamp() });
  else batch.delete(likeRef);
  batch.update(doc(db, 'posts', postId), { likesCount: increment(like ? 1 : -1) });
  await batch.commit();
}

// ---- Comentarios -----------------------------------------------------------------

export function subscribeComments(postId: string, onChange: (list: Comment[]) => void, onError: (e: Error) => void) {
  return onSnapshot(
    query(collection(db, 'posts', postId, 'comments'), orderBy('createdAt', 'asc')),
    (snap) =>
      onChange(
        snap.docs.map((d) => {
          const x = d.data({ serverTimestamps: 'estimate' });
          return {
            id: d.id,
            postId,
            authorId: x.authorId,
            authorName: x.authorName ?? '',
            authorPhoto: x.authorPhoto ?? '',
            text: x.text ?? '',
            createdAt: toIso(x.createdAt)
          };
        })
      ),
    onError
  );
}

export async function addComment(postId: string, author: { uid: string; name: string; photo: string }, text: string) {
  const batch = writeBatch(db);
  batch.set(doc(collection(db, 'posts', postId, 'comments')), {
    authorId: author.uid,
    authorName: author.name,
    authorPhoto: author.photo,
    text: text.trim(),
    createdAt: serverTimestamp()
  });
  batch.update(doc(db, 'posts', postId), { commentsCount: increment(1) });
  await batch.commit();
}

// ---- Reportes ----------------------------------------------------------------------

export async function reportPost(post: Post, reporterId: string, reason: string) {
  await addDoc(collection(db, 'reports'), {
    postId: post.id,
    postExcerpt: post.text.slice(0, 140),
    postAuthor: post.authorName,
    reporterId,
    reason,
    createdAt: serverTimestamp()
  });
}
