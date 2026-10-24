// src/components/AppBottomNav.tsx
import React from 'react';
import {
  IonFooter,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  useIonRouter
} from '@ionic/react';
import {
  checkboxOutline,
  peopleOutline,
  nutritionOutline,
  wifiOutline
} from 'ionicons/icons';
import { useLocation } from 'react-router-dom';

/**
 * Barra de Navegación Inferior (Tabs Nativos de Ionic)
 * Proporciona acceso directo y fluido a los 4 módulos principales del Challenge 06.
 */
export const AppBottomNav: React.FC = () => {
  const router = useIonRouter();
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <IonFooter className="ion-no-border">
      <IonTabBar style={{ borderTop: '1px solid var(--ion-color-step-200, #e2e8f0)', height: '56px' }}>
        {/* Módulo Tareas (Firebase Realtime Database) */}
        <IonTabButton
          tab="tasks"
          selected={pathname.startsWith('/tasks')}
          onClick={() => router.push('/tasks', 'none', 'replace')}
        >
          <IonIcon icon={checkboxOutline} />
          <IonLabel>Tareas</IonLabel>
        </IonTabButton>

        {/* Módulo Contactos (Firebase Cloud Firestore) */}
        <IonTabButton
          tab="contacts"
          selected={pathname.startsWith('/contacts')}
          onClick={() => router.push('/contacts', 'none', 'replace')}
        >
          <IonIcon icon={peopleOutline} />
          <IonLabel>Contactos</IonLabel>
        </IonTabButton>

        {/* Módulo Frutas (Dexie IndexedDB) */}
        <IonTabButton
          tab="fruits"
          selected={pathname.startsWith('/fruits')}
          onClick={() => router.push('/fruits', 'none', 'replace')}
        >
          <IonIcon icon={nutritionOutline} />
          <IonLabel>Frutas</IonLabel>
        </IonTabButton>

        {/* Sensor de Red & Diagnóstico (@capacitor/network) */}
        <IonTabButton
          tab="network"
          selected={pathname.startsWith('/network')}
          onClick={() => router.push('/network', 'none', 'replace')}
        >
          <IonIcon icon={wifiOutline} />
          <IonLabel>Red</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonFooter>
  );
};
