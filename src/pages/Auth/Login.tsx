import { useState, type CSSProperties, type FormEvent } from 'react';
import { IonContent, IonIcon, IonPage, IonSpinner } from '@ionic/react';
import { lockClosedOutline, mailOutline, pawOutline } from 'ionicons/icons';
import { Link } from 'react-router-dom';
import AuthField from './AuthField';
import { useAuth } from '../../context/AuthContext';
import { email, required, validateForm } from '../../helpers/validators';
import { authErrorMessage } from '../../services/auth.service';
import styles from './Auth.module.scss';

/** Inicio de sesion. */
export default function Login() {
  const { login } = useAuth();
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof values, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof values) => (value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const found = validateForm(values, {
      email: [required('El correo'), email],
      password: [required('La contraseña')]
    });
    setErrors(found);
    if (Object.keys(found).length) return;

    setLoading(true);
    setFormError(null);
    try {
      await login(values.email, values.password);
      // La redireccion al feed la hace AppRoutes cuando la sesion queda lista:
      // navegar tambien aqui duplicaria la seccion /app en el historial de Ionic.
    } catch (err) {
      setFormError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent>
        <div className={styles.page}>
          <span className={`${styles.brand} enter-up`}>
            <IonIcon icon={pawOutline} aria-hidden="true" />
          </span>
          <h1 className={`${styles.title} enter-up`} style={{ '--i': 1 } as CSSProperties}>
            Bienvenido de vuelta.
          </h1>
          <p className={`${styles.subtitle} enter-up`} style={{ '--i': 2 } as CSSProperties}>
            Tu manada te está esperando.
          </p>

          <form className={`${styles.form} enter-up`} style={{ '--i': 3 } as CSSProperties} onSubmit={submit} noValidate>
            <AuthField
              id="login-email"
              label="Correo electrónico"
              icon={mailOutline}
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="nombre@correo.com"
              value={values.email}
              error={errors.email}
              onChange={set('email')}
            />
            <AuthField
              id="login-password"
              label="Contraseña"
              icon={lockClosedOutline}
              type="password"
              autoComplete="current-password"
              placeholder="Tu contraseña"
              value={values.password}
              error={errors.password}
              onChange={set('password')}
            />

            {formError && (
              <p className={styles.formError} role="alert">
                {formError}
              </p>
            )}

            <button type="submit" className={styles.submit} disabled={loading}>
              {loading ? <IonSpinner name="dots" /> : 'Iniciar sesión'}
            </button>
          </form>

          <p className={styles.switch}>
            ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
          </p>
        </div>
      </IonContent>
    </IonPage>
  );
}
