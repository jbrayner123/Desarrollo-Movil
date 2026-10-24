// src/components/NetworkStatusBar.tsx
import React from 'react';
import {
  IonIcon,
  IonBadge,
  IonButton,
  IonText
} from '@ionic/react';
import {
  wifiOutline,
  cellularOutline,
  cloudOfflineOutline,
  warningOutline,
  checkmarkCircleOutline
} from 'ionicons/icons';
import { useNetwork } from '../hooks/useNetwork';

interface NetworkStatusBarProps {
  moduleName?: string;
  isFirebaseModule?: boolean;
}

/**
 * Componente de estado de red con diseno sobrio, tecnico y de alto contraste.
 * Muestra el estado del sensor Capacitor Network y el tipo de conexion.
 * Permite simular desconexion para evaluar el bloqueo en Tareas y Contactos.
 */
export const NetworkStatusBar: React.FC<NetworkStatusBarProps> = ({
  moduleName,
  isFirebaseModule = false
}) => {
  const { isOnline, connectionType, isSimulated, toggleSimulatedOffline } = useNetwork();

  const getNetworkIcon = () => {
    if (!isOnline) return cloudOfflineOutline;
    if (connectionType === 'cellular') return cellularOutline;
    return wifiOutline;
  };

  const getConnectionLabel = () => {
    if (!isOnline) return 'Sin conexion';
    if (connectionType === 'cellular') return 'Red Movil';
    if (connectionType === 'wifi') return 'Red Wi-Fi';
    return 'Conectado';
  };

  return (
    <div style={{ marginBottom: '14px' }}>
      {/* Barra de estado compacta */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          background: isOnline ? 'var(--ion-color-step-50, #f8f9fa)' : 'var(--ion-color-danger-tint, #fff0f0)',
          border: `1px solid ${isOnline ? 'var(--ion-color-step-200, #e2e8f0)' : 'var(--ion-color-danger, #eb445a)'}`,
          borderRadius: '8px',
          fontSize: '0.85rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <IonIcon
            icon={getNetworkIcon()}
            style={{
              fontSize: '1.25rem',
              color: isOnline ? 'var(--ion-color-success, #2dd36f)' : 'var(--ion-color-danger, #eb445a)'
            }}
          />
          <span style={{ fontWeight: 600 }}>
            {getConnectionLabel()}
          </span>
          <IonBadge color={isOnline ? 'success' : 'danger'} style={{ fontSize: '0.72rem' }}>
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </IonBadge>
          {isSimulated && (
            <IonBadge color="warning" style={{ fontSize: '0.70rem' }}>
              SIMULADO
            </IonBadge>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <IonButton
            size="small"
            fill="clear"
            color={isSimulated ? 'primary' : 'medium'}
            onClick={toggleSimulatedOffline}
            style={{ fontSize: '0.75rem', height: '28px', textTransform: 'none' }}
            title="Alternar simulacion de desconexion para pruebas"
          >
            <IonIcon slot="start" icon={isOnline ? cloudOfflineOutline : wifiOutline} />
            {isOnline ? 'Simular Offline' : 'Restablecer Online'}
          </IonButton>
        </div>
      </div>

      {/* Alerta de bloqueo para modulos en la nube cuando no hay conexion */}
      {!isOnline && isFirebaseModule && (
        <div
          style={{
            marginTop: '8px',
            padding: '10px 12px',
            background: 'var(--ion-color-warning-tint, #fffbe6)',
            border: '1px solid var(--ion-color-warning, #ffc409)',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <IonIcon
            icon={warningOutline}
            style={{ fontSize: '1.2rem', color: 'var(--ion-color-warning-shade, #b8860b)', flexShrink: 0 }}
          />
          <IonText style={{ fontSize: '0.82rem', color: 'var(--ion-color-dark, #1e293b)' }}>
            <strong>Acciones bloqueadas:</strong> Se requiere conexion a internet para sincronizar {moduleName || 'este modulo'} con Firebase. Las acciones de creacion, edicion y eliminacion estan deshabilitadas.
          </IonText>
        </div>
      )}

      {/* Indicador de persistencia local en Dexie cuando es modulo offline-first */}
      {!isFirebaseModule && (
        <div
          style={{
            marginTop: '6px',
            padding: '6px 12px',
            background: 'var(--ion-color-step-100, #f1f5f9)',
            border: '1px solid var(--ion-color-step-200, #cbd5e1)',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <IonIcon icon={checkmarkCircleOutline} style={{ fontSize: '1rem', color: 'var(--ion-color-success, #2dd36f)' }} />
          <IonText style={{ fontSize: '0.78rem', color: 'var(--ion-color-step-700, #475569)' }}>
            Almacenamiento Local (Dexie IndexedDB): Operatividad 100% activa sin conexion.
          </IonText>
        </div>
      )}
    </div>
  );
};
