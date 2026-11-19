import { useState } from 'react';
import { initials } from '../../helpers/format';
import styles from './Shared.module.scss';

interface AvatarProps {
  src?: string;
  name: string;
  size?: number;
  /** Punto verde de "en linea". */
  online?: boolean;
}

/** Avatar circular con respaldo de iniciales si la imagen no carga. */
export default function Avatar({ src, name, size = 40, online }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const showImage = src && !failed;

  return (
    <span className={styles.avatar} style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {showImage ? (
        <img src={src} alt={name} loading="lazy" onError={() => setFailed(true)} />
      ) : (
        <span aria-label={name}>{initials(name)}</span>
      )}
      {online && <span className={styles.online} aria-label="En línea" />}
    </span>
  );
}
