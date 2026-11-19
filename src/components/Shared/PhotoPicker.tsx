import { useState } from 'react';
import { IonIcon, IonSpinner } from '@ionic/react';
import { cameraOutline, imagesOutline, trashOutline } from 'ionicons/icons';
import { useCamera } from '../../hooks/useCamera';
import styles from './PhotoPicker.module.scss';

interface PhotoPickerProps {
  /** data URL de la foto elegida o URL ya subida. */
  value: string | null;
  onChange: (value: string | null) => void;
  /** wide = foto de publicacion; round = avatar o logo. */
  shape?: 'wide' | 'round';
  hint?: string;
  error?: string;
}

/** Selector de foto con @capacitor/camera: camara o galeria, con vista previa. */
export default function PhotoPicker({ value, onChange, shape = 'wide', hint, error }: PhotoPickerProps) {
  const { takePhoto } = useCamera();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const pick = async (source: 'camera' | 'gallery') => {
    setBusy(true);
    setMessage(null);
    try {
      const photo = await takePhoto(source);
      if (photo) onChange(photo);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'No se pudo obtener la foto.');
    } finally {
      setBusy(false);
    }
  };

  const buttons = (
    <div className={styles.buttons}>
      <button type="button" onClick={() => pick('camera')} disabled={busy}>
        <IonIcon icon={cameraOutline} aria-hidden="true" />
        Cámara
      </button>
      <button type="button" onClick={() => pick('gallery')} disabled={busy}>
        <IonIcon icon={imagesOutline} aria-hidden="true" />
        Galería
      </button>
    </div>
  );

  if (shape === 'round') {
    return (
      <div className={styles.roundWrap}>
        <span className={`${styles.round} ${error ? styles.invalid : ''}`}>
          {busy ? <IonSpinner name="dots" /> : value ? <img src={value} alt="Foto seleccionada" /> : <IonIcon icon={cameraOutline} aria-hidden="true" />}
        </span>
        <div>
          {hint && <p className={styles.hint}>{hint}</p>}
          {buttons}
          {(message || error) && <p className={styles.error}>{message ?? error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div>
      {value ? (
        <div className={styles.preview}>
          <img src={value} alt="Vista previa de la foto" />
          <button type="button" onClick={() => onChange(null)} aria-label="Quitar foto">
            <IonIcon icon={trashOutline} />
          </button>
        </div>
      ) : (
        <div className={`${styles.dropzone} ${error ? styles.invalid : ''}`}>
          {busy ? <IonSpinner name="dots" /> : <IonIcon icon={cameraOutline} className={styles.dropIcon} aria-hidden="true" />}
          {hint && <p>{hint}</p>}
          {buttons}
        </div>
      )}
      {(message || error) && <p className={styles.error}>{message ?? error}</p>}
    </div>
  );
}
