import { IonIcon } from '@ionic/react';
import { cloudOfflineOutline } from 'ionicons/icons';
import { useApp } from '../../context/AppContext';
import styles from './OfflineBanner.module.scss';

/** Aviso discreto en la parte superior cuando no hay conexion a internet. */
export default function OfflineBanner() {
  const { isOnline } = useApp();
  if (isOnline) return null;

  return (
    <div className={styles.banner} role="status">
      <IonIcon icon={cloudOfflineOutline} aria-hidden="true" />
      <span>Sin conexión. Algunas acciones no estarán disponibles.</span>
    </div>
  );
}
