import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useNetwork } from '../hooks/useNetwork';
import { useDevice, type BatteryState } from '../hooks/useDevice';
import { useHaptics } from '../hooks/useHaptics';
import { useLocalNotifications } from '../hooks/useLocalNotifications';
import { useCachedPosts } from '../hooks/useDexie';
import { cacheFeed } from '../lib/db';
import { setLike, subscribeFeed, subscribeMyLikes } from '../services/posts.service';
import { subscribeMyChats } from '../services/chats.service';
import { subscribeBusinesses } from '../services/businesses.service';
import type { Business, Chat, Post } from '../types';

/**
 * Estado compartido de la comunidad, sincronizado en tiempo real con Firestore:
 * feed, me gusta, chats, negocios, conexion y bateria. Tambien dispara las
 * notificaciones locales de mensajes nuevos y mascotas perdidas.
 */

interface AppContextValue {
  isOnline: boolean;
  battery: BatteryState;
  posts: Post[];
  feedLoading: boolean;
  /** true si el feed viene de la cache local (sin conexion). */
  feedFromCache: boolean;
  likedIds: Set<string>;
  toggleLike: (post: Post) => Promise<void>;
  chats: Chat[];
  unreadTotal: number;
  businesses: Business[];
  businessesLoading: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { isOnline } = useNetwork();
  const battery = useDevice();
  const haptics = useHaptics();
  const { notify } = useLocalNotifications();
  const cachedPosts = useCachedPosts();

  const [livePosts, setLivePosts] = useState<Post[] | null>(null);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [chats, setChats] = useState<Chat[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [businessesLoading, setBusinessesLoading] = useState(true);

  const uid = user?.uid ?? null;

  // ---- Feed en vivo + cache local con Dexie ----------------------------------
  const knownPostIds = useRef<Set<string> | null>(null);
  useEffect(() => {
    setLivePosts(null);
    knownPostIds.current = null;
    if (!uid) return;
    return subscribeFeed(
      (list, fromCache) => {
        setLivePosts(list);
        if (!fromCache) cacheFeed(list).catch(() => undefined);

        // Alerta de mascota perdida nueva publicada por otra persona.
        if (knownPostIds.current) {
          list
            .filter((p) => !knownPostIds.current!.has(p.id) && p.category === 'perdido' && p.authorId !== uid)
            .forEach((p) => {
              notify('Mascota perdida cerca', `${p.petName ?? 'Una mascota'}: ${p.location?.label ?? 'revisa el feed para ayudar'}`);
              haptics.warning();
            });
        }
        knownPostIds.current = new Set(list.map((p) => p.id));
      },
      () => setLivePosts((prev) => prev ?? [])
    );
  }, [uid, notify, haptics]);

  const posts = livePosts ?? cachedPosts ?? [];
  const feedFromCache = livePosts === null && (cachedPosts?.length ?? 0) > 0;

  // ---- Me gusta del usuario sobre las publicaciones visibles ---------------------
  const postIdsKey = posts.map((p) => p.id).join(',');
  useEffect(() => {
    if (!uid || !postIdsKey) return;
    return subscribeMyLikes(postIdsKey.split(','), uid, setLikedIds);
  }, [uid, postIdsKey]);

  const toggleLike = useCallback(
    async (post: Post) => {
      if (!uid) return;
      const like = !likedIds.has(post.id);
      haptics.tap();
      // Actualizacion optimista: el corazon cambia al instante.
      setLikedIds((s) => {
        const next = new Set(s);
        if (like) next.add(post.id);
        else next.delete(post.id);
        return next;
      });
      try {
        await setLike(post.id, uid, like);
      } catch {
        setLikedIds((s) => {
          const next = new Set(s);
          if (like) next.delete(post.id);
          else next.add(post.id);
          return next;
        });
      }
    },
    [uid, likedIds, haptics]
  );

  // ---- Chats en vivo + notificacion de mensajes nuevos -----------------------
  const lastUnread = useRef<Record<string, number> | null>(null);
  useEffect(() => {
    setChats([]);
    lastUnread.current = null;
    if (!uid) return;
    return subscribeMyChats(
      uid,
      (list) => {
        setChats(list);
        const previous = lastUnread.current;
        if (previous) {
          list.forEach((c) => {
            const now = c.unread[uid] ?? 0;
            const viewing = window.location.pathname === `/app/chat/${c.id}`;
            if (now > (previous[c.id] ?? 0) && c.lastSenderId !== uid && !viewing) {
              const from = c.memberInfo[c.lastSenderId]?.name ?? 'Nuevo mensaje';
              notify(from, c.lastMessage);
              haptics.tap();
            }
          });
        }
        lastUnread.current = Object.fromEntries(list.map((c) => [c.id, c.unread[uid] ?? 0]));
      },
      () => setChats([])
    );
  }, [uid, notify, haptics]);

  // ---- Negocios (directorio y mapa) ------------------------------------------
  useEffect(() => {
    setBusinessesLoading(true);
    if (!uid) return;
    return subscribeBusinesses(
      (list) => {
        setBusinesses(list);
        setBusinessesLoading(false);
      },
      () => setBusinessesLoading(false)
    );
  }, [uid]);

  const value = useMemo<AppContextValue>(
    () => ({
      isOnline,
      battery,
      posts,
      feedLoading: livePosts === null && posts.length === 0,
      feedFromCache,
      likedIds,
      toggleLike,
      chats,
      unreadTotal: uid ? chats.reduce((sum, c) => sum + (c.unread[uid] ?? 0), 0) : 0,
      businesses,
      businessesLoading
    }),
    [isOnline, battery, posts, livePosts, feedFromCache, likedIds, toggleLike, chats, uid, businesses, businessesLoading]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp debe usarse dentro de AppProvider');
  return ctx;
}
