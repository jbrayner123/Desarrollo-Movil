import { IonIcon } from '@ionic/react';
import { IonSpinner } from '@ionic/react';
import { cameraOutline, checkmarkCircle, alertCircleOutline, pawOutline } from 'ionicons/icons';
import { optimizedUrl } from '../../services/cloudinary';
import type { Pet } from '../../types';
import styles from './PetProfileCard.module.scss';

interface PetProfileCardProps {
  pet: Pet;
  onChangePhoto: () => void;
  uploading?: boolean;
}

/** Ficha de la mascota: foto, nombre, raza, datos rapidos y estado de vacunas. */
export default function PetProfileCard({ pet, onChangePhoto, uploading = false }: PetProfileCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.photo}>
        {pet.photoUrl ? (
          <img src={optimizedUrl(pet.photoUrl, 800)} alt={`Foto de ${pet.name}`} />
        ) : (
          <span className={styles.noPhoto}>
            <IonIcon icon={pawOutline} aria-hidden="true" />
          </span>
        )}
        <button type="button" className={styles.photoButton} onClick={onChangePhoto} disabled={uploading} aria-label="Cambiar foto de la mascota">
          {uploading ? <IonSpinner name="dots" /> : <IonIcon icon={cameraOutline} />}
        </button>
      </div>

      <div className={styles.body}>
        <div className={styles.titleRow}>
          <div>
            <h2>{pet.name}</h2>
            <p>{pet.breed}</p>
          </div>
          <span className={`${styles.vaccines} ${pet.vaccinesUpToDate ? styles.ok : styles.pending}`}>
            <IonIcon icon={pet.vaccinesUpToDate ? checkmarkCircle : alertCircleOutline} aria-hidden="true" />
            {pet.vaccinesUpToDate ? 'Vacunas al día' : 'Vacunas pendientes'}
          </span>
        </div>

        <div className={styles.facts}>
          <div>
            <strong>{pet.ageYears}</strong>
            <span>{pet.ageYears === 1 ? 'año' : 'años'}</span>
          </div>
          <div>
            <strong>{pet.weightKg}</strong>
            <span>kg</span>
          </div>
          <div>
            <strong>Cali</strong>
            <span>ciudad</span>
          </div>
        </div>

        {pet.bio && <p className={styles.bio}>{pet.bio}</p>}
      </div>
    </article>
  );
}
