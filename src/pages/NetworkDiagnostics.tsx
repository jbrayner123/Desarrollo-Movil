// src/pages/NetworkDiagnostics.tsx
import React from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonBadge,
  IonIcon,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonButtons,
  IonAlert
} from '@ionic/react';
import {
  wifiOutline,
  cellularOutline,
  cloudOfflineOutline,
  cloudDoneOutline,
  hardwareChipOutline,
  serverOutline,
  logOutOutline
} from 'ionicons/icons';
import { useNetwork } from '../hooks/useNetwork';
import { useAuthContext } from '../context/AuthContext';
import { AppBottomNav } from '../components/AppBottomNav';

/**
 * Vista de Diagnóstico de Red y Estado de Persistencia
 * Monitorea el sensor @capacitor/network y explica el comportamiento de los motores de datos.
 */
const NetworkDiagnostics: React.FC = () => {
  const { isOnline, connectionType, isSimulated, toggleSimulatedOffline } = useNetwork();
  const { logout } = useAuthContext();
  const [showLogoutAlert, setShowLogoutAlert] = React.useState(false);

  const getNetworkIcon = () => {
    if (!isOnline) return cloudOfflineOutline;
    if (connectionType === 'cellular') return cellularOutline;
    return wifiOutline;
  };

  const getConnectionName = () => {
    if (!isOnline) return 'Sin conexion a internet';
    if (connectionType === 'cellular') return 'Conexion Celular / Datos Moviles';
    if (connectionType === 'wifi') return 'Conexion de Red Wi-Fi';
    return 'Conexion Activa';
  };

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar color="primary">
          <IonTitle>Sensor de Red & Diagnostico</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setShowLogoutAlert(true)} title="Cerrar Sesion">
              <IonIcon slot="icon-only" icon={logOutOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        <div className="container-responsive">
          {/* Tarjeta principal del sensor */}
          <IonCard>
            <IonCardHeader>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <IonCardTitle style={{ fontSize: '1.2rem' }}>Sensor @capacitor/network</IonCardTitle>
                <IonBadge color={isOnline ? 'success' : 'danger'} style={{ fontSize: '0.85rem' }}>
                  {isOnline ? 'CONECTADO' : 'SIN CONEXION'}
                </IonBadge>
              </div>
            </IonCardHeader>

            <IonCardContent>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px',
                  borderRadius: '8px',
                  background: isOnline ? 'var(--ion-color-step-50, #f8f9fa)' : 'var(--ion-color-danger-tint, #fff0f0)',
                  border: `1px solid ${isOnline ? 'var(--ion-color-step-200, #e2e8f0)' : 'var(--ion-color-danger, #eb445a)'}`,
                  marginBottom: '16px'
                }}
              >
                <IonIcon
                  icon={getNetworkIcon()}
                  style={{
                    fontSize: '2.5rem',
                    color: isOnline ? 'var(--ion-color-success, #2dd36f)' : 'var(--ion-color-danger, #eb445a)'
                  }}
                />
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontWeight: 600, fontSize: '1.05rem' }}>
                    {getConnectionName()}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--ion-color-step-600, #64748b)' }}>
                    Tipo detectado: <strong>{connectionType.toUpperCase()}</strong> | Sensor: <strong>Capacitor Native API</strong>
                  </p>
                </div>
              </div>

              {/* Boton de simulacion para pruebas */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <IonButton
                  expand="block"
                  fill="outline"
                  color={isSimulated ? 'warning' : 'primary'}
                  onClick={toggleSimulatedOffline}
                >
                  <IonIcon slot="start" icon={isOnline ? cloudOfflineOutline : wifiOutline} />
                  {isOnline ? 'Simular Modo Offline (Probar Bloqueo)' : 'Restablecer Conexion Online'}
                </IonButton>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--ion-color-step-500, #94a3b8)', textAlign: 'center' }}>
                  {isSimulated
                    ? 'Modo de prueba activo: Contactos y Tareas estan bloqueados, Frutas funciona normalmente.'
                    : 'Usa este boton para probar el bloqueo sin desconectar tu red fisica.'}
                </p>
              </div>
            </IonCardContent>
          </IonCard>

          {/* Matriz de Persistencia y Reglas de Negocio */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle style={{ fontSize: '1.15rem' }}>Matriz de Motores de Persistencia</IonCardTitle>
            </IonCardHeader>

            <IonList lines="full" style={{ padding: '0 8px 8px 8px' }}>
              {/* 1. Firestore */}
              <IonItem>
                <IonIcon slot="start" icon={cloudDoneOutline} color="secondary" />
                <IonLabel>
                  <h3 style={{ fontWeight: 600 }}>1. Cloud Firestore (Contactos)</h3>
                  <p style={{ fontSize: '0.82rem', marginTop: '2px' }}>
                    Hook: <code>useCollection(&quot;contacts&quot;)</code> | Almacenamiento en la nube
                  </p>
                  <p style={{ fontSize: '0.80rem', color: isOnline ? 'var(--ion-color-success)' : 'var(--ion-color-danger)' }}>
                    Estado: {isOnline ? 'Operatividad completa' : 'ESCRITURA BLOQUEADA (Requiere internet)'}
                  </p>
                </IonLabel>
                <IonBadge slot="end" color={isOnline ? 'success' : 'danger'}>
                  {isOnline ? 'ACTIVO' : 'PAUSADO'}
                </IonBadge>
              </IonItem>

              {/* 2. Realtime Database */}
              <IonItem>
                <IonIcon slot="start" icon={serverOutline} color="tertiary" />
                <IonLabel>
                  <h3 style={{ fontWeight: 600 }}>2. Realtime Database (Tareas)</h3>
                  <p style={{ fontSize: '0.82rem', marginTop: '2px' }}>
                    Hook: <code>useRealTimeCollection(&quot;tasks&quot;)</code> | Sockets en tiempo real
                  </p>
                  <p style={{ fontSize: '0.80rem', color: isOnline ? 'var(--ion-color-success)' : 'var(--ion-color-danger)' }}>
                    Estado: {isOnline ? 'Sincronizacion reactiva en vivo' : 'ESCRITURA BLOQUEADA (Requiere internet)'}
                  </p>
                </IonLabel>
                <IonBadge slot="end" color={isOnline ? 'success' : 'danger'}>
                  {isOnline ? 'EN VIVO' : 'PAUSADO'}
                </IonBadge>
              </IonItem>

              {/* 3. Dexie IndexedDB */}
              <IonItem lines="none">
                <IonIcon slot="start" icon={hardwareChipOutline} color="success" />
                <IonLabel>
                  <h3 style={{ fontWeight: 600 }}>3. Dexie.js IndexedDB (Frutas)</h3>
                  <p style={{ fontSize: '0.82rem', marginTop: '2px' }}>
                    Hook: <code>useDexie(&quot;frutas&quot;)</code> | Base de datos local indexada
                  </p>
                  <p style={{ fontSize: '0.80rem', color: 'var(--ion-color-success)' }}>
                    Estado: 100% OPERATIVO OFFLINE (Nunca se bloquea)
                  </p>
                </IonLabel>
                <IonBadge slot="end" color="success">
                  OFFLINE-FIRST
                </IonBadge>
              </IonItem>
            </IonList>
          </IonCard>
        </div>

        {/* Alerta de confirmacion de cierre de sesion */}
        <IonAlert
          isOpen={showLogoutAlert}
          onDidDismiss={() => setShowLogoutAlert(false)}
          header="Cerrar Sesion"
          message="Deseas salir del sistema?"
          buttons={[
            { text: 'Cancelar', role: 'cancel' },
            {
              text: 'Cerrar Sesion',
              role: 'destructive',
              handler: async () => {
                await logout();
              }
            }
          ]}
        />
      </IonContent>

      {/* Navegación inferior persistente */}
      <AppBottomNav />
    </IonPage>
  );
};

export default NetworkDiagnostics;
