import { memo } from 'react';
import { IonIcon } from '@ionic/react';
import { arrowForward, shieldCheckmarkOutline, star, timeOutline } from 'ionicons/icons';
import type { Business, VetTone } from '../../types';
import { averageRating, businessInitials, recommendation } from '../../services/businesses.service';
import { optimizedUrl } from '../../services/cloudinary';
import { formatDistance, formatNumber } from '../../helpers/format';
import styles from './VetCard.module.scss';

interface VetCardProps {
  business: Business;
  tone: VetTone;
  distanceKm: number | null;
  onOpen: (business: Business) => void;
}

/** Tarjeta de negocio: cabecera pastel, recomendacion, verificacion, calificacion y distancia. */
function VetCard({ business: b, tone, distanceKm, onOpen }: VetCardProps) {
  const rec = recommendation(b);
  const avg = averageRating(b);

  return (
    <article className={styles.card}>
      <div className={`${styles.top} ${styles[tone]}`}>
        <span className={styles.initials}>
          {b.logoUrl ? <img src={optimizedUrl(b.logoUrl, 160)} alt={`Logo de ${b.name}`} loading="lazy" /> : businessInitials(b.name)}
        </span>
        <div className={styles.score}>
          {rec !== null ? (
            <p className={styles.percent}>
              {rec}
              <span>%</span>
            </p>
          ) : (
            <p className={styles.newTag}>Nuevo</p>
          )}
          <p className={styles.verified}>
            <IonIcon icon={b.verified ? shieldCheckmarkOutline : timeOutline} aria-hidden="true" />
            {b.verified ? (rec !== null ? 'Recomendada · Verificada' : 'Verificada') : 'Sin verificar'}
          </p>
        </div>
      </div>

      <div className={styles.body}>
        <h3>{b.name}</h3>
        <p className={styles.tagline}>{b.tagline || b.neighborhood || b.address}</p>
        <div className={styles.meta}>
          <span className={styles.rating}>
            <IonIcon icon={star} aria-hidden="true" />
            {avg !== null ? (
              <>
                <strong>{avg.toLocaleString('es-CO')}</strong>
                <span>({formatNumber(b.ratingCount)} {b.ratingCount === 1 ? 'reseña' : 'reseñas'})</span>
              </>
            ) : (
              <span>Sin reseñas aún</span>
            )}
          </span>
          {distanceKm !== null && <span className={styles.distance}>{formatDistance(distanceKm)}</span>}
        </div>
        <button type="button" className={styles.button} onClick={() => onOpen(b)}>
          {b.type === 'vet' ? 'Conocer veterinaria' : 'Conocer tienda'}
          <IonIcon icon={arrowForward} aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}

export default memo(VetCard);
