import { useState, type InputHTMLAttributes } from 'react';
import { IonIcon } from '@ionic/react';
import { eyeOffOutline, eyeOutline } from 'ionicons/icons';
import styles from './Auth.module.scss';

interface AuthFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  id: string;
  label: string;
  icon: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}

/** Campo de formulario con icono, mensaje de error y opcion de mostrar la contrasena. */
export default function AuthField({ id, label, icon, value, error, onChange, type = 'text', ...rest }: AuthFieldProps) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <div className={`${styles.control} ${error ? styles.controlError : ''}`}>
        <IonIcon icon={icon} aria-hidden="true" />
        <input
          id={id}
          type={isPassword && visible ? 'text' : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            className={styles.toggle}
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            <IonIcon icon={visible ? eyeOffOutline : eyeOutline} />
          </button>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className={styles.fieldError}>
          {error}
        </p>
      )}
    </div>
  );
}
