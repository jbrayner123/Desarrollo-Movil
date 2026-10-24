// parcial-02/src/pages/AuthPage.tsx
import React, { useState } from 'react';
import { IonPage, IonContent, IonSpinner, IonToast } from '@ionic/react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const AuthPage: React.FC = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setToastMessage('Por favor completa todos los campos.');
      return;
    }
    if (mode === 'register' && !name.trim()) {
      setToastMessage('Por favor ingresa tu nombre de agente.');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'login') {
        const { error } = await login(email, password);
        if (error) {
          setToastMessage(error);
        } else {
          navigate('/dashboard', { replace: true });
        }
      } else {
        const { error } = await register(name, email, password);
        if (error) {
          setToastMessage(error);
        } else {
          navigate('/dashboard', { replace: true });
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen className="ion-padding" style={{ '--background': 'var(--color-cream-base)' } as React.CSSProperties}>
        <div
          style={{
            maxWidth: '380px',
            margin: '0 auto',
            paddingTop: 'var(--safe-area-top-custom)',
            paddingBottom: 'var(--safe-area-bottom-custom)'
          }}
        >
          {/* Logo Minimalista Superior */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="2" width="9" height="9" rx="2" fill="var(--color-charcoal-dark)" />
              <rect x="13" y="2" width="9" height="9" rx="2" fill="var(--color-terracotta)" />
              <rect x="2" y="13" width="9" height="9" rx="2" fill="var(--color-stone)" />
              <rect x="13" y="13" width="9" height="9" rx="2" fill="var(--color-charcoal-dark)" />
            </svg>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--color-charcoal-dark)' }}>
              meetgen.misiones
            </span>
          </div>

          {/* Tarjeta Hero Central Estilo Meetgen Vista 1 */}
          <div
            style={{
              position: 'relative',
              background: 'var(--color-charcoal-dark)',
              borderRadius: '24px',
              height: '240px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 12px 32px rgba(28, 28, 30, 0.15)',
              marginBottom: '28px'
            }}
          >
            {/* Lineas concentricas sutiles en SVG */}
            <svg
              style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.18 }}
              viewBox="0 0 300 240"
              fill="none"
            >
              <ellipse cx="150" cy="120" rx="40" ry="40" stroke="#ffffff" strokeWidth="1" />
              <ellipse cx="150" cy="120" rx="75" ry="75" stroke="#ffffff" strokeWidth="1" />
              <ellipse cx="150" cy="120" rx="110" ry="110" stroke="#ffffff" strokeWidth="1" />
              <ellipse cx="150" cy="120" rx="145" ry="145" stroke="#ffffff" strokeWidth="1" />
            </svg>

            {/* Estrella geometrica de 4 puntas en terracota (#E86A33) */}
            <svg width="68" height="68" viewBox="0 0 100 100" fill="none" style={{ zIndex: 2 }}>
              <path
                d="M50 0 C50 35 65 50 100 50 C65 50 50 65 50 100 C50 65 35 50 0 50 C35 50 50 35 50 0 Z"
                fill="var(--color-terracotta)"
              />
            </svg>
          </div>

          {/* Titulo Editorial Grande */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h1 className="text-title-editorial">
              {mode === 'login' ? 'Acceso al Sistema de Misiones.' : 'Crea tu Identidad de Agente.'}
            </h1>
            <p className="text-subtitle-editorial">
              {mode === 'login'
                ? 'Ingresa tus credenciales para registrar evidencia, desplazamientos y telemetria.'
                : 'Registrate con Firebase Auth para sincronizar tu puntaje en el ranking real.'}
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {mode === 'register' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#6A675F', textTransform: 'uppercase', marginBottom: 4, letterSpacing: '0.04em' }}>
                  Nombre Completo
                </label>
                <input
                  type="text"
                  placeholder="Ej. Jose Minotta"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    background: 'var(--color-cream-surface)',
                    border: '1px solid rgba(28, 28, 30, 0.12)',
                    fontSize: '0.92rem',
                    color: 'var(--color-charcoal-dark)',
                    outline: 'none'
                  }}
                  required
                />
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#6A675F', textTransform: 'uppercase', marginBottom: 4, letterSpacing: '0.04em' }}>
                Correo Electronico
              </label>
              <input
                type="email"
                placeholder="agente@meetgen.dev"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: 'var(--color-cream-surface)',
                  border: '1px solid rgba(28, 28, 30, 0.12)',
                  fontSize: '0.92rem',
                  color: 'var(--color-charcoal-dark)',
                  outline: 'none'
                }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#6A675F', textTransform: 'uppercase', marginBottom: 4, letterSpacing: '0.04em' }}>
                Contrasena
              </label>
              <input
                type="password"
                placeholder="Minimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: 'var(--color-cream-surface)',
                  border: '1px solid rgba(28, 28, 30, 0.12)',
                  fontSize: '0.92rem',
                  color: 'var(--color-charcoal-dark)',
                  outline: 'none'
                }}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-meetgen-primary"
              disabled={submitting}
              style={{ marginTop: '12px' }}
            >
              {submitting ? (
                <IonSpinner name="crescent" style={{ width: 20, height: 20 }} />
              ) : mode === 'login' ? (
                'Ingresar a la Mision'
              ) : (
                'Completar Registro'
              )}
            </button>
          </form>

          {/* Switch inferior */}
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <span style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)' }}>
              {mode === 'login' ? 'No tienes cuenta? ' : 'Ya tienes cuenta? '}
            </span>
            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-terracotta)',
                fontWeight: 700,
                fontSize: '0.84rem',
                cursor: 'pointer'
              }}
            >
              {mode === 'login' ? 'Registrate' : 'Inicia Sesion'}
            </button>
          </div>
        </div>

        <IonToast
          isOpen={!!toastMessage}
          message={toastMessage || ''}
          duration={3000}
          onDidDismiss={() => setToastMessage(null)}
        />
      </IonContent>
    </IonPage>
  );
};
