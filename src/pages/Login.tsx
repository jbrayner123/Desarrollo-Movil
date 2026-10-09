// src/pages/Login.tsx
import React, { useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonItem,
  IonInput,
  IonButton,
  IonIcon,
  IonToast,
  IonNote,
  IonLoading,
  useIonRouter
} from '@ionic/react';
import { logInOutline, lockClosedOutline, personAddOutline } from 'ionicons/icons';
import { useAuthContext } from '../context/AuthContext';

/**
 * Pantalla de Inicio de Sesion (Login)
 * Integra autenticacion con Firebase mediante AuthContext
 */
const Login: React.FC = () => {
  const router = useIonRouter();
  const { login, error, clearError } = useAuthContext();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    // Validaciones de formulario
    if (!email.trim() || !password.trim()) {
      setLocalError('Por favor ingresa tu correo y contrasena.');
      return;
    }

    if (!email.includes('@')) {
      setLocalError('El correo electronico no tiene un formato valido.');
      return;
    }

    if (password.length < 6) {
      setLocalError('La contrasena debe tener al menos 6 caracteres.');
      return;
    }

    setIsSubmitting(true);
    const success = await login(email, password);
    setIsSubmitting(false);

    if (success) {
      // Redirigir al panel de tareas protegido
      router.push('/tasks', 'root', 'replace');
    }
  };

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar color="primary">
          <IonTitle>Task Manager Pro</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        <div className="login-wrapper">
          <IonCard>
            <IonCardHeader className="ion-text-center">
              <div className="auth-hero-icon">
                <IonIcon icon={lockClosedOutline} />
              </div>
              <IonCardTitle>Iniciar Sesion</IonCardTitle>
              <IonCardSubtitle>Accede a tu gestor de tareas movil</IonCardSubtitle>
            </IonCardHeader>

            <IonCardContent>
              <form onSubmit={handleSubmit}>
                <IonItem lines="none" className="custom-input-item">
                  <IonInput
                    label="Correo Electronico"
                    labelPlacement="floating"
                    type="email"
                    placeholder="usuario@ejemplo.com"
                    value={email}
                    onIonInput={(e) => setEmail(e.detail.value || '')}
                    required
                  />
                </IonItem>

                <IonItem lines="none" className="custom-input-item">
                  <IonInput
                    label="Contrasena"
                    labelPlacement="floating"
                    type="password"
                    placeholder="Minimo 6 caracteres"
                    value={password}
                    onIonInput={(e) => setPassword(e.detail.value || '')}
                    required
                  />
                </IonItem>

                <IonButton
                  expand="block"
                  type="submit"
                  className="btn-modern"
                  disabled={isSubmitting}
                >
                  <IonIcon slot="start" icon={logInOutline} />
                  Ingresar
                </IonButton>

                <IonButton
                  expand="block"
                  fill="clear"
                  color="medium"
                  style={{ marginTop: '8px' }}
                  onClick={() => router.push('/register', 'forward', 'push')}
                >
                  <IonIcon slot="start" icon={personAddOutline} />
                  No tienes cuenta? Registrate aqui
                </IonButton>
              </form>

              {/* Indicaciones para evaluacion en clase */}
              <div className="demo-credentials-box ion-text-center">
                <IonNote color="medium">
                  <strong>Modo Evaluacion:</strong><br />
                  Puedes ingresar con cualquier correo valido y clave (minimo 6 caracteres) o registrar un nuevo usuario con Firebase Console.
                </IonNote>
              </div>
            </IonCardContent>
          </IonCard>
        </div>

        {/* Notificacion Toast para feedback de errores */}
        <IonToast
          isOpen={!!localError || !!error}
          onDidDismiss={() => {
            setLocalError(null);
            clearError();
          }}
          message={localError || error || ''}
          duration={3500}
          color="danger"
          position="top"
        />

        {/* Indicador de carga mientras responde Firebase */}
        <IonLoading
          isOpen={isSubmitting}
          message="Autenticando con Firebase..."
          spinner="crescent"
        />
      </IonContent>
    </IonPage>
  );
};

export default Login;
