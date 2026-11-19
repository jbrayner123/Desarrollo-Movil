import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useRef } from 'react';
import {
  IonContent,
  IonIcon,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  useIonRouter,
  useIonToast,
  type RefresherEventDetail
} from '@ionic/react';
import { cameraOutline, cloudOfflineOutline, locationOutline, optionsOutline, pawOutline, pricetagOutline, searchOutline, starOutline } from 'ionicons/icons';
import { collection, getCountFromServer } from 'firebase/firestore';

import PageHeader from '../../components/Shared/PageHeader';
import CompactHeader from '../../components/Shared/CompactHeader';
import { useScrollHeader } from '../../hooks/useScrollHeader';
import FilterChips, { type ChipOption } from '../../components/Shared/FilterChips';
import EmptyState from '../../components/Shared/EmptyState';
import PlanCard from '../../components/Feed/PlanCard';
import PostCard from '../../components/Feed/PostCard';
import PostSkeleton from '../../components/Feed/PostSkeleton';
import CommentsSheet from '../../components/Feed/CommentsSheet';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useStartChat } from '../../hooks/useStartChat';
import { useLocalNotifications } from '../../hooks/useLocalNotifications';
import { useHaptics } from '../../hooks/useHaptics';
import { db } from '../../lib/firebase';
import { deletePost, reportPost } from '../../services/posts.service';
import { sendMessage, ensureChat } from '../../services/chats.service';
import { timeAgo } from '../../helpers/format';
import type { Post } from '../../types';
import styles from './Feed.module.scss';

type Filter = 'todos' | 'momento' | 'paseo' | 'perdido' | 'tips' | 'promo';
type Sort = 'recientes' | 'populares';

const FILTERS: ChipOption<Filter>[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'momento', label: 'Momentos', icon: cameraOutline },
  { value: 'paseo', label: 'Paseos', icon: pawOutline },
  { value: 'perdido', label: 'Perdidos', icon: locationOutline },
  { value: 'tips', label: 'Tips', icon: starOutline },
  { value: 'promo', label: 'Promos', icon: pricetagOutline }
];

const matches = (post: Post, filter: Filter) =>
  filter === 'todos' ||
  (filter === 'tips' ? post.category === 'tip' || post.category === 'aviso' : post.category === filter);

/** Feed principal de la comunidad, en tiempo real con Firestore. */
export default function Feed() {
  // Encabezado que se oculta al bajar y reaparece al subir.
  const scroll = useScrollHeader();
  const contentRef = useRef<HTMLIonContentElement>(null);
  const router = useIonRouter();
  const [presentToast] = useIonToast();
  const { user, identity, isAdmin } = useAuth();
  const { posts, feedLoading, feedFromCache, likedIds, toggleLike, isOnline } = useApp();
  const { startChat } = useStartChat();
  const { notify } = useLocalNotifications();
  const haptics = useHaptics();

  const [filter, setFilter] = useState<Filter>('todos');
  const [sort, setSort] = useState<Sort>('recientes');
  const [commentsPost, setCommentsPost] = useState<Post | null>(null);
  const [community, setCommunity] = useState<number | null>(null);

  // Tamano de la comunidad: conteo agregado en el servidor.
  useEffect(() => {
    getCountFromServer(collection(db, 'users'))
      .then((r) => setCommunity(r.data().count))
      .catch(() => setCommunity(null));
  }, []);

  const visible = useMemo(() => {
    const list = posts.filter((p) => matches(p, filter));
    return [...list].sort((a, b) => (sort === 'recientes' ? b.createdAt.localeCompare(a.createdAt) : b.likesCount - a.likesCount));
  }, [posts, filter, sort]);

  // El "Plan de hoy" es el paseo mas reciente de otra persona.
  const nextWalk = useMemo(() => posts.find((p) => p.category === 'paseo' && p.authorId !== user?.uid), [posts, user?.uid]);

  // El feed ya es en vivo; el gesto solo confirma la actualizacion.
  const refresh = (e: CustomEvent<RefresherEventDetail>) => window.setTimeout(() => e.detail.complete(), 600);

  const toast = (message: string) => presentToast({ message, duration: 1800, position: 'top' });

  const converse = (post: Post) =>
    startChat({ uid: post.authorId, name: post.authorName, photo: post.authorPhoto, role: post.authorRole });

  /** Confirmar un paseo: avisa al autor por chat y programa un recordatorio local. */
  const joinWalk = async (post: Post) => {
    if (!user || !identity) return;
    if (!isOnline) return toast('Necesitas conexión para unirte al paseo.');
    try {
      const chatId = await ensureChat(
        { uid: user.uid, ...identity },
        { uid: post.authorId, name: post.authorName, photo: post.authorPhoto, role: post.authorRole }
      );
      await sendMessage(chatId, user.uid, post.authorId, `Me uno al paseo: "${post.text.slice(0, 80)}"`);
      haptics.success();
      notify('Paseo confirmado', `Le avisamos a ${post.authorName} que te unes.`);
      notify('Recordatorio de paseo', `Tu paseo con ${post.authorName} está por comenzar.`, 60);
      toast('Te uniste al paseo. Te recordaremos en una hora.');
    } catch {
      toast('No se pudo confirmar el paseo.');
    }
  };

  const report = async (post: Post, reason: string) => {
    if (!user) return;
    try {
      await reportPost(post, user.uid, reason);
      toast('Gracias, revisaremos esta publicación.');
    } catch {
      toast('No se pudo enviar el reporte.');
    }
  };

  const remove = async (post: Post) => {
    try {
      await deletePost(post.id);
      toast('Publicación eliminada.');
    } catch {
      toast('No se pudo eliminar la publicación.');
    }
  };

  const firstName = user?.displayName.split(' ')[0] ?? '';

  return (
    <IonPage>
      <CompactHeader title="Tu manada" visible={scroll.compactVisible} contentRef={contentRef} />
      <IonContent fullscreen ref={contentRef} {...scroll.contentProps}>
        <IonRefresher slot="fixed" onIonRefresh={refresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="page-pad">
          <PageHeader eyebrow={`Hola, ${firstName}`} title="Tu manada, más cerca.">
            <span className={styles.metaItem}>
              <IonIcon icon={locationOutline} aria-hidden="true" />
              {user?.city ?? 'Cali, Colombia'}
            </span>
            {community !== null && (
              <>
                <span className={styles.separator} aria-hidden="true">
                  ·
                </span>
                <span className={styles.metaItem}>
                  <span className={styles.liveDot} aria-hidden="true" />
                  {community} {community === 1 ? 'miembro' : 'miembros'} en la comunidad
                </span>
              </>
            )}
          </PageHeader>

          <FilterChips options={FILTERS} value={filter} onChange={setFilter} ariaLabel="Filtrar publicaciones" />

          {nextWalk ? (
            <PlanCard
              title={nextWalk.text.length > 60 ? `${nextWalk.text.slice(0, 60).trim()}...` : nextWalk.text}
              detail={[nextWalk.location?.label, timeAgo(nextWalk.createdAt)].filter(Boolean).join(' · ')}
              onOpen={() => router.push('/app/mapa', 'none', 'replace')}
            />
          ) : (
            <PlanCard
              title="¿Un paseo en buena compañía?"
              detail="Publica un plan y encuentra compañía"
              onOpen={() => router.push('/app/crear', 'forward')}
            />
          )}

          {feedFromCache && (
            <div className={styles.cacheNotice}>
              <IonIcon icon={cloudOfflineOutline} aria-hidden="true" />
              Mostrando publicaciones guardadas en el teléfono.
            </div>
          )}

          <div className={styles.sectionHead}>
            <h2>En tu comunidad</h2>
            <button
              type="button"
              className={styles.sortButton}
              onClick={() => setSort((s) => (s === 'recientes' ? 'populares' : 'recientes'))}
              aria-label={`Ordenar por ${sort === 'recientes' ? 'más populares' : 'más recientes'}`}
            >
              {sort === 'recientes' ? 'Más recientes' : 'Más populares'}
              <IonIcon icon={optionsOutline} aria-hidden="true" />
            </button>
          </div>

          {feedLoading ? (
            <>
              <PostSkeleton />
              <PostSkeleton />
            </>
          ) : visible.length === 0 ? (
            <EmptyState
              icon={searchOutline}
              title="Nada por aquí todavía"
              text={filter === 'todos' ? 'Sé el primero en compartir algo con la comunidad.' : 'Aún no hay publicaciones en esta categoría.'}
            />
          ) : (
            visible.map((post, i) => (
              <div key={post.id} className="enter-up" style={{ '--i': Math.min(i, 6) } as CSSProperties}>
                <PostCard
                  post={post}
                  liked={likedIds.has(post.id)}
                  isMine={post.authorId === user?.uid}
                  canModerate={isAdmin}
                  onLike={toggleLike}
                  onComments={setCommentsPost}
                  onConverse={converse}
                  onJoinWalk={joinWalk}
                  onReport={report}
                  onDelete={remove}
                />
              </div>
            ))
          )}

          {!feedLoading && visible.length > 0 && <p className={styles.footer}>Hecho para quienes dejan huella.</p>}
        </div>

        <CommentsSheet post={commentsPost} onClose={() => setCommentsPost(null)} />
      </IonContent>
    </IonPage>
  );
}
