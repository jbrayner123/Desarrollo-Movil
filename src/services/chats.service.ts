import {
  collection,
  doc,
  getDoc,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch
} from 'firebase/firestore';
import { db, toIso } from '../lib/firebase';
import type { Chat, ChatMember, Message, PostLocation } from '../types';

/** El id del chat son los dos uid ordenados: cada pareja tiene un unico chat. */
export const chatIdFor = (a: string, b: string): string => [a, b].sort().join('_');

function mapChat(id: string, x: Record<string, unknown>): Chat {
  return {
    id,
    members: (x.members as string[]) ?? [],
    memberInfo: (x.memberInfo as Record<string, ChatMember>) ?? {},
    lastMessage: (x.lastMessage as string) ?? '',
    lastSenderId: (x.lastSenderId as string) ?? '',
    updatedAt: toIso(x.updatedAt),
    unread: (x.unread as Record<string, number>) ?? {}
  };
}

/** Abre (o crea si no existe) el chat entre dos usuarios y devuelve su id. */
export async function ensureChat(me: { uid: string } & ChatMember, other: { uid: string } & ChatMember): Promise<string> {
  const id = chatIdFor(me.uid, other.uid);
  const ref = doc(db, 'chats', id);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const members = [me.uid, other.uid].sort();
    await setDoc(ref, {
      members,
      memberInfo: {
        [me.uid]: { name: me.name, photo: me.photo, role: me.role },
        [other.uid]: { name: other.name, photo: other.photo, role: other.role }
      },
      lastMessage: '',
      lastSenderId: '',
      updatedAt: serverTimestamp(),
      unread: { [me.uid]: 0, [other.uid]: 0 }
    });
  }
  return id;
}

/** Chats del usuario en vivo, ordenados por actividad reciente. */
export function subscribeMyChats(uid: string, onChange: (list: Chat[]) => void, onError: (e: Error) => void) {
  return onSnapshot(
    query(collection(db, 'chats'), where('members', 'array-contains', uid)),
    (snap) =>
      onChange(
        snap.docs
          .map((d) => mapChat(d.id, d.data({ serverTimestamps: 'estimate' })))
          // Los chats abiertos sin ningun mensaje no se listan.
          .filter((c) => c.lastMessage !== '')
          .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      ),
    onError
  );
}

export function subscribeChat(chatId: string, onChange: (c: Chat | null) => void, onError: (e: Error) => void) {
  return onSnapshot(doc(db, 'chats', chatId), (snap) => onChange(snap.exists() ? mapChat(snap.id, snap.data({ serverTimestamps: 'estimate' })) : null), onError);
}

export function subscribeMessages(chatId: string, onChange: (list: Message[]) => void, onError: (e: Error) => void) {
  return onSnapshot(
    query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt', 'asc')),
    { includeMetadataChanges: true },
    (snap) =>
      onChange(
        snap.docs.map((d) => {
          const x = d.data({ serverTimestamps: 'estimate' });
          return {
            id: d.id,
            senderId: x.senderId,
            text: x.text ?? '',
            kind: x.kind === 'location' ? 'location' : 'text',
            location: x.location,
            createdAt: toIso(x.createdAt),
            pending: d.metadata.hasPendingWrites
          } satisfies Message;
        })
      ),
    onError
  );
}

/**
 * Envia un mensaje y actualiza el resumen del chat y los no leidos del otro miembro.
 * Con `location` el mensaje es una ubicacion compartida (el texto es la direccion).
 */
export async function sendMessage(chatId: string, senderId: string, otherId: string, text: string, location?: PostLocation): Promise<void> {
  const batch = writeBatch(db);
  batch.set(doc(collection(db, 'chats', chatId, 'messages')), {
    senderId,
    text: text.trim(),
    kind: location ? 'location' : 'text',
    ...(location ? { location } : {}),
    createdAt: serverTimestamp()
  });
  batch.update(doc(db, 'chats', chatId), {
    lastMessage: location ? 'Ubicación compartida' : text.trim().slice(0, 120),
    lastSenderId: senderId,
    updatedAt: serverTimestamp(),
    [`unread.${otherId}`]: increment(1)
  });
  await batch.commit();
}

export const markChatRead = (chatId: string, uid: string) => updateDoc(doc(db, 'chats', chatId), { [`unread.${uid}`]: 0 });
