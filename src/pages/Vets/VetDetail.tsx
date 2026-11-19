import { useState, type CSSProperties } from 'react';
import { IonContent, IonIcon, IonModal, IonPage, IonSpinner, useIonToast } from '@ionic/react';
import {
  alertCircleOutline,
  callOutline,
  chatbubbleOutline,
  informationCircleOutline,
  locationOutline,
  navigateOutline,
  shieldCheckmarkOutline,
  star,
  starOutline,
  timeOutline
} from 'ionicons/icons';
import { useParams } from 'react-router-dom';
import DetailHeader from '../../components/Shared/DetailHeader';
import { useScrollHeader } from '../../hooks/useScrollHeader';
import EmptyState from '../../components/Shared/EmptyState';
import Avatar from '../../components/Shared/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useRealtime } from '../../hooks/useRealtime';
import { useStartChat } from '../../hooks/useStartChat';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useHaptics } from '../../hooks/useHaptics';
import {
  addReview,
  averageRating,
  businessInitials,
  recommendation,
  subscribeBusiness,
  subscribeReviews
} from '../../services/businesses.service';
import { optimizedUrl } from '../../services/cloudinary';
import { distanceKm, directionsUrl } from '../../helpers/geo';
import { formatDistance, formatNumber, timeAgo } from '../../helpers/format';
import type { Business, Review } from '../../types';
import styles from './Vets.module.scss';

/** Detalle de una veterinaria o petshop: contacto, servicios, resenas, chat y como llegar. */
export default function VetDetail() {
  const scroll = useScrollHeader(60);
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { isOnline } = useApp();
  const { startChat, opening } = useStartChat();
  const { position } = useGeolocation();
  const haptics = useHaptics();
  const [presentToast] = useIonToast();

  const { data: business, loading } = useRealtime<Business | null>((onData, onError) => subscribeBusiness(id, onData, onError), [id], null);
  const { data: reviews } = useRealtime<Review[]>((onData, onError) => subscribeReviews(id, onData, onError), [id], []);

  const [reviewOpen, setReviewOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [sending, setSending] = useState(false);

  const alreadyReviewed = reviews.some((r) => r.authorId === user?.uid);
  const canReview = user?.role === 'owner' && business && business.ownerId !== user.uid && !alreadyReviewed;

  const submitReview = async () => {
    if (!user || !business || rating === 0) return;
    setSending(true);
    try {
      await addReview(business.id, user, rating, reviewText);
      haptics.success();
      setReviewOpen(false);
      setRating(0);
      setReviewText('');
      presentToast({ message: 'Gracias por tu reseña.', duration: 1600, position: 'top' });
    } catch {
      presentToast({ message: 'No se pudo guardar la reseña.', duration: 2000, position: 'top' });
    } finally {
      setSending(false);
    }
  };

  const rec = business ? recommendation(business) : null;
  const avg = business ? averageRating(business) : null;

  return (
    <IonPage>
      <DetailHeader hidden={scroll.headerHidden} fallback="/app/servicios" title={business ? (business.type === 'vet' ? 'Veterinaria' : 'Petshop') : ''} />
      <IonContent fullscreen {...scroll.contentProps}>
        {loading ? (
          <div className={styles.loading}>
            <IonSpinner name="dots" />
          </div>
        ) : !business ? (
          <EmptyState icon={alertCircleOutline} title="Negocio no encontrado" text="Es posible que ya no esté disponible en el directorio." />
        ) : (
          <div className={styles.detail}>
            <section className={`${styles.hero} ${styles.mint} enter-up`}>
              <span className={styles.heroInitials}>
                {business.logoUrl ? <img src={optimizedUrl(business.logoUrl, 200)} alt={`Logo de ${business.name}`} /> : businessInitials(business.name)}
              </span>
              <h1>{business.name}</h1>
              {business.tagline && <p>{business.tagline}</p>}
              <span className={styles.verifiedTag}>
                <IonIcon icon={business.verified ? shieldCheckmarkOutline : timeOutline} aria-hidden="true" />
                {business.verified ? 'Verificada por Manada' : 'Pendiente de verificación'}
              </span>
            </section>

            <section className={`${styles.stats} enter-up`} style={{ '--i': 1 } as CSSProperties}>
              <div>
                <strong>{rec !== null ? `${rec}%` : '--'}</strong>
                <span>Recomendación</span>
              </div>
              <div>
                <strong className={styles.statRating}>
                  <IonIcon icon={star} aria-hidden="true" />
                  {avg !== null ? avg.toLocaleString('es-CO') : '--'}
                </strong>
                <span>
                  {formatNumber(business.ratingCount)} {business.ratingCount === 1 ? 'reseña' : 'reseñas'}
                </span>
              </div>
              <div>
                <strong>{position ? formatDistance(distanceKm(position, business.location)) : '--'}</strong>
                <span>Distancia</span>
              </div>
            </section>

            <section className={`${styles.infoCard} enter-up`} style={{ '--i': 2 } as CSSProperties}>
              <p className={styles.infoRow}>
                <IonIcon icon={locationOutline} aria-hidden="true" />
                <span>
                  {business.address}
                  {business.neighborhood && `, ${business.neighborhood}`}
                </span>
              </p>
              {business.directions && (
                <p className={styles.infoRow}>
                  <IonIcon icon={informationCircleOutline} aria-hidden="true" />
                  {business.directions}
                </p>
              )}
              {business.schedule && (
                <p className={styles.infoRow}>
                  <IonIcon icon={timeOutline} aria-hidden="true" />
                  {business.schedule}
                </p>
              )}
              {business.phone && (
                <a className={styles.infoRow} href={`tel:${business.phone.replace(/\s/g, '')}`}>
                  <IonIcon icon={callOutline} aria-hidden="true" />
                  {business.phone}
                </a>
              )}
            </section>

            {business.services.length > 0 && (
              <section className="enter-up" style={{ '--i': 3 } as CSSProperties}>
                <h2 className={styles.subTitle}>Servicios</h2>
                <div className={styles.services}>
                  {business.services.map((s) => (
                    <span key={s}>{s}</span>
                  ))}
                </div>
              </section>
            )}

            <div className={styles.detailActions}>
              <a className={styles.secondaryButton} href={directionsUrl(business.location)} target="_blank" rel="noopener noreferrer">
                <IonIcon icon={navigateOutline} aria-hidden="true" />
                Cómo llegar
              </a>
              {business.ownerId !== user?.uid && (
                <button
                  type="button"
                  className={styles.primaryButton}
                  disabled={opening || !isOnline}
                  onClick={() => startChat({ uid: business.ownerId, name: business.name, photo: business.logoUrl, role: business.type })}
                >
                  {opening ? <IonSpinner name="dots" /> : <IonIcon icon={chatbubbleOutline} aria-hidden="true" />}
                  Escribir
                </button>
              )}
            </div>

            <section className={styles.reviews}>
              <div className={styles.reviewsHead}>
                <h2 className={styles.subTitle}>Reseñas</h2>
                {canReview && (
                  <button type="button" className={styles.reviewButton} onClick={() => setReviewOpen(true)} disabled={!isOnline}>
                    Calificar
                  </button>
                )}
              </div>
              {reviews.length === 0 ? (
                <p className={styles.noReviews}>Aún no hay reseñas. {canReview ? 'Sé el primero en calificar.' : ''}</p>
              ) : (
                reviews.map((r) => (
                  <article key={r.id} className={styles.review}>
                    <Avatar src={optimizedUrl(r.authorPhoto, 100)} name={r.authorName} size={36} />
                    <div>
                      <p className={styles.reviewAuthor}>
                        {r.authorName} <span>{timeAgo(r.createdAt)}</span>
                      </p>
                      <p className={styles.reviewStars} aria-label={`${r.rating} de 5 estrellas`}>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <IonIcon key={n} icon={n <= r.rating ? star : starOutline} />
                        ))}
                      </p>
                      {r.text && <p className={styles.reviewText}>{r.text}</p>}
                    </div>
                  </article>
                ))
              )}
            </section>
          </div>
        )}

        <IonModal isOpen={reviewOpen} onDidDismiss={() => setReviewOpen(false)} className="sheet-modal" initialBreakpoint={0.6} breakpoints={[0, 0.6]} handle>
          <div className={styles.reviewSheet}>
            <h2>¿Cómo te fue en {business?.name}?</h2>
            <div className={styles.starPicker} role="radiogroup" aria-label="Calificación">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} estrellas`} onClick={() => { setRating(n); haptics.tap(); }}>
                  <IonIcon icon={n <= rating ? star : starOutline} />
                </button>
              ))}
            </div>
            <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Cuenta tu experiencia (opcional)" maxLength={300} rows={3} />
            <button type="button" className={styles.primaryButton} disabled={rating === 0 || sending} onClick={submitReview}>
              {sending ? <IonSpinner name="dots" /> : 'Publicar reseña'}
            </button>
          </div>
        </IonModal>
      </IonContent>
    </IonPage>
  );
}
