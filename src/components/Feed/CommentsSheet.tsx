import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import { IonContent, IonFooter, IonHeader, IonIcon, IonModal, IonSpinner } from '@ionic/react';
import { chatbubblesOutline, close, send } from 'ionicons/icons';
import type { Comment, Post } from '../../types';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useRealtime } from '../../hooks/useRealtime';
import { useHaptics } from '../../hooks/useHaptics';
import { addComment, subscribeComments } from '../../services/posts.service';
import { optimizedUrl } from '../../services/cloudinary';
import { timeAgo } from '../../helpers/format';
import Avatar from '../Shared/Avatar';
import EmptyState from '../Shared/EmptyState';
import styles from './CommentsSheet.module.scss';

interface CommentsSheetProps {
  post: Post | null;
  onClose: () => void;
}

const MAX = 280;

/**
 * Hoja inferior de comentarios en tiempo real.
 * - Encabezado fijo con el total y de quien es la publicacion.
 * - Lista desplazable con burbujas; los comentarios propios se distinguen.
 * - Campo de escritura siempre visible (expandToScroll = false), en cualquier altura de la hoja.
 */
export default function CommentsSheet({ post, onClose }: CommentsSheetProps) {
  const { isOnline } = useApp();
  const { user, identity } = useAuth();
  const haptics = useHaptics();
  const modalRef = useRef<HTMLIonModalElement>(null);
  const contentRef = useRef<HTMLIonContentElement>(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const postId = post?.id ?? null;
  const { data: comments, loading } = useRealtime<Comment[]>(
    postId ? (onData, onError) => subscribeComments(postId, onData, onError) : null,
    [postId],
    []
  );

  // Al llegar un comentario nuevo se muestra el final de la lista.
  useEffect(() => {
    if (comments.length) contentRef.current?.scrollToBottom(250);
  }, [comments.length]);

  // Limpia el borrador al cambiar de publicacion.
  useEffect(() => {
    setText('');
    setError(null);
  }, [postId]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const value = text.trim();
    if (!post || !user || !identity || !value) return;
    // El campo se limpia al instante (el comentario ya aparece en la lista);
    // si el envio falla, el texto vuelve al campo para no perderlo.
    setText('');
    setSending(true);
    setError(null);
    haptics.tap();
    try {
      await addComment(post.id, { uid: user.uid, name: identity.name, photo: identity.photo }, value);
    } catch {
      setText(value);
      setError('No se pudo enviar el comentario. Intenta de nuevo.');
    } finally {
      setSending(false);
    }
  };

  const remaining = MAX - text.length;
  const count = comments.length;

  return (
    <IonModal
      ref={modalRef}
      isOpen={!!post}
      onDidDismiss={onClose}
      className={`sheet-modal ${styles.modal}`}
      initialBreakpoint={0.6}
      breakpoints={[0, 0.6, 0.92]}
      expandToScroll={false}
      handle
    >
      <IonHeader className="ion-no-border">
        <div className={styles.header}>
          <div className={styles.headerText}>
            <h2>
              Comentarios
              {count > 0 && <span className={styles.count}>{count}</span>}
            </h2>
            {post && <p>Publicación de {post.authorName}</p>}
          </div>
          <button type="button" className={styles.close} onClick={() => modalRef.current?.dismiss()} aria-label="Cerrar comentarios">
            <IonIcon icon={close} />
          </button>
        </div>
      </IonHeader>

      <IonContent ref={contentRef} className={styles.content}>
        {loading ? (
          <div className={styles.loading}>
            <IonSpinner name="dots" />
          </div>
        ) : count === 0 ? (
          <EmptyState icon={chatbubblesOutline} title="Sé el primero en comentar" text="Comparte un consejo, una pregunta o un saludo con la comunidad." />
        ) : (
          <ul className={styles.list}>
            {comments.map((c, i) => {
              const mine = c.authorId === user?.uid;
              return (
                <li key={c.id} className={`${styles.item} enter-up`} style={{ '--i': Math.min(i, 6) } as CSSProperties}>
                  <Avatar src={optimizedUrl(c.authorPhoto, 100)} name={c.authorName} size={36} />
                  <div className={styles.body}>
                    <div className={`${styles.bubble} ${mine ? styles.mine : ''}`}>
                      <p className={styles.author}>{mine ? 'Tú' : c.authorName}</p>
                      <p className={styles.text}>{c.text}</p>
                    </div>
                    <time className={styles.time} dateTime={c.createdAt}>
                      {timeAgo(c.createdAt)}
                    </time>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </IonContent>

      <IonFooter className="ion-no-border">
        <div className={styles.footer}>
          {error && <p className={styles.error}>{error}</p>}
          <form className={styles.composer} onSubmit={submit}>
            <Avatar src={optimizedUrl(identity?.photo, 100)} name={identity?.name ?? 'Tú'} size={36} />
            <div className={styles.field}>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={isOnline ? 'Escribe un comentario...' : 'Sin conexión'}
                maxLength={MAX}
                disabled={!isOnline}
                enterKeyHint="send"
                aria-label="Escribe un comentario"
              />
              {remaining <= 40 && <span className={`${styles.counter} ${remaining <= 10 ? styles.counterLow : ''}`}>{remaining}</span>}
            </div>
            <button type="submit" className={styles.send} disabled={!text.trim() || !isOnline || sending} aria-label="Enviar comentario">
              {sending ? <IonSpinner name="dots" /> : <IonIcon icon={send} />}
            </button>
          </form>
        </div>
      </IonFooter>
    </IonModal>
  );
}
