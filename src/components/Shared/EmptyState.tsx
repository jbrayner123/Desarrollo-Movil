import type { ReactNode } from 'react';
import { IonIcon } from '@ionic/react';
import styles from './Shared.module.scss';

interface EmptyStateProps {
  icon: string;
  title: string;
  text: string;
  action?: ReactNode;
}

/** Estado vacio o de error con icono, mensaje y accion opcional. */
export default function EmptyState({ icon, title, text, action }: EmptyStateProps) {
  return (
    <div className={styles.empty}>
      <span className={styles.emptyIcon}>
        <IonIcon icon={icon} aria-hidden="true" />
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}
