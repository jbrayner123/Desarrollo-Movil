import type { ReactNode } from 'react';
import styles from './Shared.module.scss';

interface PageHeaderProps {
  /** Texto pequeno sobre el titulo, por ejemplo "Hola, Mariana". */
  eyebrow?: string;
  title: string;
  /** Contenido bajo el titulo (ubicacion, contador, descripcion). */
  children?: ReactNode;
  /** Accion a la derecha del titulo (por ejemplo un boton de filtros). */
  action?: ReactNode;
}

/** Encabezado editorial grande, como en el prototipo ("Tu manada, más cerca."). */
export default function PageHeader({ eyebrow, title, children, action }: PageHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headerTop}>
        <div>
          {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
          <h1 className={styles.title}>{title}</h1>
        </div>
        {action && <div className={styles.headerAction}>{action}</div>}
      </div>
      {children && <div className={styles.headerMeta}>{children}</div>}
    </header>
  );
}
