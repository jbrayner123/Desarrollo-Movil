import type { ReactNode } from 'react';
import { IonHeader, IonIcon, IonToolbar, useIonRouter } from '@ionic/react';
import { chevronBack } from 'ionicons/icons';
import styles from './Shared.module.scss';

interface DetailHeaderProps {
  title?: ReactNode;
  /** Ruta a la que volver si no hay historial (por ejemplo al abrir un enlace directo). */
  fallback: string;
  end?: ReactNode;
  /** Icono del boton de volver (por defecto una flecha). */
  backIcon?: string;
  backLabel?: string;
  /** Oculta la barra (por ejemplo mientras el usuario se desplaza hacia abajo). */
  hidden?: boolean;
}

/** Barra superior de las vistas de detalle con boton de volver redondo. */
export default function DetailHeader({ title, fallback, end, backIcon = chevronBack, backLabel = 'Volver', hidden = false }: DetailHeaderProps) {
  const router = useIonRouter();
  const back = () => (router.canGoBack() ? router.goBack() : router.push(fallback, 'root', 'replace'));

  return (
    <IonHeader className={`ion-no-border ${styles.detailHeader} ${hidden ? styles.detailHeaderHidden : ''}`}>
      <IonToolbar className={styles.detailToolbar}>
        <div className={styles.detailBar}>
          <button type="button" className={styles.roundButton} onClick={back} aria-label={backLabel}>
            <IonIcon icon={backIcon} aria-hidden="true" />
          </button>
          <div className={styles.detailTitle}>{title}</div>
          <div className={styles.detailEnd}>{end}</div>
        </div>
      </IonToolbar>
    </IonHeader>
  );
}
