import React, { useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonSpinner,
  IonToast,
  IonIcon
} from '@ionic/react';
import {
  lockClosedOutline,
  mailOutline,
  personOutline,
  logInOutline,
  personAddOutline,
  shieldCheckmarkOutline
} from 'ionicons/icons';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const AuthPage: React.FC = () => {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('danger');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setToastColor('danger');
      setToastMessage('Por favor completa todos los campos obligatorios.');
      return;
    }

    if (mode === 'register' && !nombre.trim()) {
      setToastColor('danger');
      setToastMessage('Por favor ingresa tu nombre completo.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          setToastColor('danger');
          const msg = error.message?.toLowerCase().includes('fetch')
            ? 'Error de conexion (Failed to fetch). Por favor verifica tu conexion a internet y que VITE_SUPABASE_URL y VITE_SUPABASE_KEY en .env sean las credenciales de tu proyecto Supabase.'
            : error.message || 'Error al iniciar sesion';
          setToastMessage(msg);
        } else {
          setToastColor('success');
          setToastMessage('Sesion iniciada correctamente.');
          navigate('/tasks', { replace: true });
        }
      } else {
        const { error } = await signUp(email, password, nombre);
        if (error) {
          setToastColor('danger');
          const msg = error.message?.toLowerCase().includes('fetch')
            ? 'Error de conexion (Failed to fetch). Por favor verifica tu conexion a internet y que VITE_SUPABASE_URL y VITE_SUPABASE_KEY en .env sean las credenciales de tu proyecto Supabase.'
            : error.message || 'Error al registrar usuario';
          setToastMessage(msg);
        } else {
          setToastColor('success');
          setToastMessage('Registro exitoso. Se ha iniciado sesion automaticamente.');
          navigate('/tasks', { replace: true });
        }
      }
    } catch (err: any) {
      setToastColor('danger');
      const msg = err.message?.toLowerCase().includes('fetch')
        ? 'Error de conexion (Failed to fetch). Por favor verifica que las credenciales en .env sean las de tu proyecto de Supabase.'
        : err.message || 'Ocurrio un error inesperado';
      setToastMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonTitle>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IonIcon icon={shieldCheckmarkOutline} style={{ color: '#0284c7' }} />
              <span style={{ fontSize: '0.95rem', fontWeight: 700, letterSpacing: '0.04em' }}>
                SUPABASE AUTH & STORAGE
              </span>
            </div>
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <div className="auth-card">
          <div className="auth-header">
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '8px',
                background: '#0f172a',
                border: '1px solid #1e293b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px auto'
              }}
            >
              <IonIcon
                icon={mode === 'login' ? logInOutline : personAddOutline}
                style={{ fontSize: '24px', color: '#38bdf8' }}
              />
            </div>
            <h1>{mode === 'login' ? 'Acceso al Laboratorio' : 'Crear Nueva Cuenta'}</h1>
            <p>
              {mode === 'login'
                ? 'Ingresa tus credenciales para gestionar tus tareas y avatar.'
                : 'Registrate para obtener almacenamiento aislado con politicas RLS.'}
            </p>
          </div>

          <div className="auth-nav-tabs">
            <button
              type="button"
              className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`}
              onClick={() => setMode('login')}
            >
              Iniciar Sesion
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${mode === 'register' ? 'active' : ''}`}
              onClick={() => setMode('register')}
            >
              Registrarse
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div className="auth-input-group">
                <label className="auth-label">
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <IonIcon icon={personOutline} />
                    Nombre Completo
                  </span>
                </label>
                <input
                  type="text"
                  className="auth-input-field"
                  placeholder="Ej. Jose Minotta"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
            )}

            <div className="auth-input-group">
              <label className="auth-label">
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <IonIcon icon={mailOutline} />
                  Correo Electronico
                </span>
              </label>
              <input
                type="email"
                className="auth-input-field"
                placeholder="usuario@dominio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="auth-input-group">
              <label className="auth-label">
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <IonIcon icon={lockClosedOutline} />
                  Contrasena
                </span>
              </label>
              <input
                type="password"
                className="auth-input-field"
                placeholder="Minimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <IonButton
              expand="block"
              type="submit"
              color="primary"
              disabled={isSubmitting}
              style={{ marginTop: '24px', fontWeight: 600, letterSpacing: '0.04em' }}
            >
              {isSubmitting ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <IonSpinner name="crescent" style={{ width: 18, height: 18 }} />
                  <span>Procesando...</span>
                </div>
              ) : mode === 'login' ? (
                'Ingresar'
              ) : (
                'Completar Registro'
              )}
            </IonButton>
          </form>
        </div>

        <IonToast
          isOpen={!!toastMessage}
          message={toastMessage || ''}
          duration={3500}
          color={toastColor}
          onDidDismiss={() => setToastMessage(null)}
        />
      </IonContent>
    </IonPage>
  );
};
