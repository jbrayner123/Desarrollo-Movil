import { memo, useState } from 'react';
import { IonIcon, useIonActionSheet, useIonAlert, useIonToast } from '@ionic/react';
import {
  chatbubbleOutline,
  checkmarkCircleOutline,
  ellipsisHorizontal,
  heart,
  heartOutline,
  locationOutline,
  paperPlaneOutline,
  shieldCheckmark
} from 'ionicons/icons';
import type { Post } from '../../types';
import { timeAgo } from '../../helpers/format';
import { optimizedUrl } from '../../services/cloudinary';
import Avatar from '../Shared/Avatar';
import { CATEGORY_META, ROLE_LABEL } from './categories';
import styles from './PostCard.module.scss';

interface PostCardProps {
  post: Post;
  liked: boolean;
  isMine: boolean;
  canModerate: boolean;
  onLike: (post: Post) => void;
  onComments: (post: Post) => void;
  onConverse: (post: Post) => void;
  onJoinWalk: (post: Post) => void;
  onReport: (post: Post, reason: string) => void;
  onDelete: (post: Post) => void;
}

const REPORT_REASONS = ['Venta de animales', 'Spam o publicidad', 'Contenido ofensivo', 'Información falsa'];

/**
 * Tarjeta de publicacion: autor, foto con categoria y ubicacion, texto y barra de
 * acciones (Me gusta, Comentarios, Conversar). Los paseos permiten unirse.
 */
function PostCard({ post, liked, isMine, canModerate, onLike, onComments, onConverse, onJoinWalk, onReport, onDelete }: PostCardProps) {
  const meta = CATEGORY_META[post.category];
  const [pop, setPop] = useState(false);
  // Las fotos verticales se muestran mas altas (4:5) para no cortar a la mascota.
  const [portrait, setPortrait] = useState(false);
  const [presentSheet] = useIonActionSheet();
  // Menu independiente para los motivos del reporte: si se abriera con el mismo menu de
  // opciones, Ionic lo cerraria junto con el primero.
  const [presentReasons] = useIonActionSheet();
  const [presentAlert] = useIonAlert();
  const [presentToast] = useIonToast();
  const isBusinessPost = post.authorRole === 'vet' || post.authorRole === 'petshop';

  const like = () => {
    if (!liked) setPop(true);
    onLike(post);
  };

  const confirmDelete = () =>
    presentAlert({
      header: 'Eliminar publicación',
      message: 'Esta acción no se puede deshacer.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'destructive', handler: () => onDelete(post) }
      ]
    });

  const chooseReason = () =>
    presentReasons({
      header: '¿Por qué reportas esta publicación?',
      buttons: [
        ...REPORT_REASONS.map((reason) => ({ text: reason, handler: () => onReport(post, reason) })),
        { text: 'Cancelar', role: 'cancel' }
      ]
    });

  const openOptions = () =>
    presentSheet({
      header: post.authorName,
      buttons: [
        {
          text: 'Copiar texto',
          handler: () => {
            navigator.clipboard?.writeText(post.text).catch(() => undefined);
            presentToast({ message: 'Texto copiado.', duration: 1500, position: 'top' });
          }
        },
        ...(isMine || canModerate ? [{ text: 'Eliminar publicación', role: 'destructive', handler: confirmDelete }] : []),
        // Los motivos se abren cuando el menu de opciones termina de cerrarse.
        ...(!isMine ? [{ text: 'Reportar publicación', role: 'destructive', handler: () => void window.setTimeout(chooseReason, 350) }] : []),
        { text: 'Cancelar', role: 'cancel' }
      ]
    });

  return (
    <article className={styles.card}>
      <header className={styles.head}>
        <Avatar src={optimizedUrl(post.authorPhoto, 120)} name={post.authorName} size={44} />
        <div className={styles.author}>
          <h3>
            {post.authorName}
            {isBusinessPost && (
              <span className={styles.roleTag}>
                <IonIcon icon={shieldCheckmark} aria-hidden="true" />
                {ROLE_LABEL[post.authorRole]}
              </span>
            )}
          </h3>
          <time dateTime={post.createdAt}>{timeAgo(post.createdAt)}</time>
        </div>
        <button type="button" className={styles.iconButton} onClick={openOptions} aria-label="Más opciones">
          <IonIcon icon={ellipsisHorizontal} />
        </button>
      </header>

      {post.imageUrl ? (
        <div className={`${styles.media} ${portrait ? styles.portrait : ''}`}>
          <img
            src={optimizedUrl(post.imageUrl)}
            alt={post.petName ? `Foto de ${post.petName}` : `Foto de ${post.authorName}`}
            loading="lazy"
            onLoad={(e) => setPortrait(e.currentTarget.naturalHeight > e.currentTarget.naturalWidth * 1.1)}
          />
          <span className={`${styles.badge} ${styles[meta.tone]}`}>
            <IonIcon icon={meta.icon} aria-hidden="true" />
            {meta.badge}
          </span>
          {post.location && (
            <span className={styles.location}>
              <IonIcon icon={locationOutline} aria-hidden="true" />
              {post.location.label}
            </span>
          )}
        </div>
      ) : (
        <div className={styles.inlineMeta}>
          <span className={`${styles.badge} ${styles.inline} ${styles[meta.tone]}`}>
            <IonIcon icon={meta.icon} aria-hidden="true" />
            {meta.badge}
          </span>
          {post.location && (
            <span className={styles.inlineLocation}>
              <IonIcon icon={locationOutline} aria-hidden="true" />
              {post.location.label}
            </span>
          )}
        </div>
      )}

      {(post.text || post.petName) && (
        <p className={styles.text}>
          {post.petName && <strong>{post.petName}. </strong>}
          {post.text}
        </p>
      )}

      {post.category === 'paseo' && !isMine && (
        <button type="button" className={styles.joinButton} onClick={() => onJoinWalk(post)}>
          <IonIcon icon={checkmarkCircleOutline} aria-hidden="true" />
          Me uno al paseo
        </button>
      )}

      <footer className={styles.actions}>
        <button
          type="button"
          className={`${styles.action} ${liked ? styles.liked : ''}`}
          onClick={like}
          aria-pressed={liked}
          aria-label={liked ? 'Quitar me gusta' : 'Me gusta'}
        >
          <IonIcon icon={liked ? heart : heartOutline} className={pop ? styles.pop : undefined} onAnimationEnd={() => setPop(false)} />
          <span>{post.likesCount}</span>
        </button>
        <button type="button" className={styles.action} onClick={() => onComments(post)} aria-label="Ver comentarios">
          <IonIcon icon={chatbubbleOutline} />
          <span>{post.commentsCount}</span>
        </button>
        {!isMine && (
          <button type="button" className={`${styles.action} ${styles.converse}`} onClick={() => onConverse(post)}>
            <IonIcon icon={paperPlaneOutline} />
            <span>Conversar</span>
          </button>
        )}
      </footer>
    </article>
  );
}

export default memo(PostCard);
