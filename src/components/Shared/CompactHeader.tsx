import type { ReactNode, RefObject } from 'react';
import styles from './CompactHeader.module.scss';

interface CompactHeaderProps {
  title: string;
  visible: boolean;
  /** Contenido a desplazar hacia arriba al tocar la barra. */
  contentRef: RefObject<HTMLIonContentElement | null>;
  action?: ReactNode;
}

/**
 * Barra compacta para las pantallas principales: aparece al desplazarse hacia
 * arriba (cuando el titulo grande ya salio de la pantalla) y se oculta al bajar.
 * Tocarla regresa al inicio de la pagina.
 */
export default function CompactHeader({ title, visible, contentRef, action }: CompactHeaderProps) {
  return (
    <div className={`${styles.bar} ${visible ? styles.visible : ''}`} aria-hidden={!visible}>
      <button type="button" className={styles.title} onClick={() => contentRef.current?.scrollToTop(350)} tabIndex={visible ? 0 : -1}>
        {title}
      </button>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
