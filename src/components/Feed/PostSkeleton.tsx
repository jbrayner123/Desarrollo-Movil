import { IonSkeletonText } from '@ionic/react';
import styles from './Feed.module.scss';

/** Esqueleto de carga con la misma forma de PostCard. */
export default function PostSkeleton() {
  return (
    <div className={styles.skeleton} aria-hidden="true">
      <div className={styles.skeletonHead}>
        <IonSkeletonText animated className={styles.skeletonAvatar} />
        <div className={styles.skeletonLines}>
          <IonSkeletonText animated style={{ width: '50%', height: 14 }} />
          <IonSkeletonText animated style={{ width: '28%', height: 10 }} />
        </div>
      </div>
      <IonSkeletonText animated className={styles.skeletonMedia} />
      <IonSkeletonText animated style={{ width: '92%', height: 12, marginTop: 14 }} />
      <IonSkeletonText animated style={{ width: '70%', height: 12 }} />
    </div>
  );
}
