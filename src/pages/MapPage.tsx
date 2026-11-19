import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import MapComponent from '../components/MapComponent';

/** Pantalla principal: barra superior y el mapa con sus sensores. */
export default function MapPage() {
  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonTitle>Mapas y Sensores</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <MapComponent />
      </IonContent>
    </IonPage>
  );
}
