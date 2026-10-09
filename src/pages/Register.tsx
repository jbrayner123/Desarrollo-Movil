// src/pages/Register.tsx
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
  IonLoading,
  useIonRouter
} from '@ionic/react';
import { personAddOutline, arrowBackOutline } from 'ionicons/icons';
import { useAuthContext } from '../context/AuthContext';

/**
 * Pantalla de Registro de Usuario (Register)
 * Crea nuevas credenciales con Firebase Auth
 */
const Register: React.FC = () => {
  const router = useIonRouter();
  const { register, error, clearError } = useAuthContext();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    if (!email.trim() || !password.trim()) {
      setLocalError('Por favor completa todos los campos.');
      return;
    }

    if (!email.includes('@')) {
      setLocalError('El correo electrónico no es válido.');
      return;
    }

    if (password.length < 6) {
      setLocalError('La contraseña debe contener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Las contraseñas no coinciden.');
      return;
    }

    setIsSubmitting(true);
    const success = await register(email, password);
    setIsSubmitting(false);

    if (success) {
      router.push('/tasks', 'root', 'replace');
    }
  };

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar color="primary">
          <IonTitle>Registro de Usuario</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        <div className="login-wrapper">
          <IonCard>
            <IonCardHeader className="ion-text-center">
              <div className="auth-hero-icon">
                <IonIcon icon={personAddOutline} />
              </div>
              <IonCardTitle>Crear Cuenta</IonCardTitle>
              <IonCardSubtitle>Regístrate para gestionar tus tareas</IonCardSubtitle>
            </IonCardHeader>

            <IonCardContent>
              <form onSubmit={handleSubmit}>
                <IonItem lines="none" className="custom-input-item">
                  <IonInput
                    label="Correo Electrónico"
                    labelPlacement="floating"
                    type="email"
                    placeholder="nuevo@ejemplo.com"
                    value={email}
                    onIonInput={(e) => setEmail(e.detail.value || '')}
                    required
                  />
                </IonItem>

                <IonItem lines="none" className="custom-input-item">
                  <IonInput
                    label="Contraseña"
                    labelPlacement="floating"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onIonInput={(e) => setPassword(e.detail.value || '')}
                    required
                  />
                </IonItem>

                <IonItem lines="none" className="custom-input-item">
                  <IonInput
                    label="Confirmar Contraseña"
                    labelPlacement="floating"
                    type="password"
                    placeholder="Repite tu contraseña"
                    value={confirmPassword}
                    onIonInput={(e) => setConfirmPassword(e.detail.value || '')}
                    required
                  />
                </IonItem>

                <IonButton
                  expand="block"
                  type="submit"
                  className="btn-modern"
                  disabled={isSubmitting}
                >
                  <IonIcon slot="start" icon={personAddOutline} />
                  Registrarme
                </IonButton>

                <IonButton
                  expand="block"
                  fill="clear"
                  color="medium"
                  style={{ marginTop: '8px' }}
                  onClick={() => router.push('/login', 'back', 'pop')}
                >
                  <IonIcon slot="start" icon={arrowBackOutline} />
                  ¿Ya tienes cuenta? Inicia sesión
                </IonButton>
              </form>
            </IonCardContent>
          </IonCard>
        </div>

        {/* Feedback visual de errores */}
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

        <IonLoading
          isOpen={isSubmitting}
          message="Registrando cuenta en Firebase..."
          spinner="crescent"
        />
      </IonContent>
    </IonPage>
  );
};

export default Register;
