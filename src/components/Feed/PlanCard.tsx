import { IonIcon } from '@ionic/react';
import { arrowForward } from 'ionicons/icons';
import styles from './Feed.module.scss';

interface PlanCardProps {
  title: string;
  detail: string;
  onOpen: () => void;
}

/** Tarjeta amarilla destacada "Plan de hoy" con boton circular oscuro. */
export default function PlanCard({ title, detail, onOpen }: PlanCardProps) {
  return (
    <button type="button" className={styles.plan} onClick={onOpen}>
      <div className={styles.planBody}>
        <p className={styles.planEyebrow}>
          <span className={styles.dot} aria-hidden="true" />
          Plan de hoy
        </p>
        <h2 className={styles.planTitle}>{title}</h2>
        <p className={styles.planDetail}>{detail}</p>
      </div>
      <span className={styles.planButton} aria-hidden="true">
        <IonIcon icon={arrowForward} />
      </span>
    </button>
  );
}
