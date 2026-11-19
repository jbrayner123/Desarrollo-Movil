import { useState } from 'react';
import {
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonModal,
  IonText,
  IonTitle,
  IonToolbar,
  useIonAlert
} from '@ionic/react';
import type { SesionRuta } from '../types';
import { formatearDistancia, formatearDuracion } from '../utils/format';

interface Props {
  abierto: boolean;
  sesiones: SesionRuta[];
  onCerrar: () => void;
  onVerEnMapa: (sesion: SesionRuta) => void;
  onEliminar: (id: string) => void;
  onVaciar: () => void;
}

/** Modal con el historial de sesiones guardado en formato JSON. */
export default function RouteHistoryModal(p: Props) {
  const [jsonVisible, setJsonVisible] = useState<string | null>(null);
  const [presentarAlerta] = useIonAlert();

  const confirmarVaciar = () =>
    presentarAlerta({
      header: 'Borrar historial',
      message: 'Se eliminaran todas las sesiones guardadas. Esta accion no se puede deshacer.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Borrar', role: 'destructive', handler: p.onVaciar }
      ]
    });

  return (
    <IonModal isOpen={p.abierto} onDidDismiss={p.onCerrar}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Historial de rutas</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={p.onCerrar}>Cerrar</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding contenido">
        {p.sesiones.length === 0 ? (
          <IonText color="medium">
            <p className="texto-vacio">
              Aun no hay sesiones guardadas. Inicia y detiene un seguimiento para registrar una ruta.
            </p>
          </IonText>
        ) : (
          <>
            <div className="encabezado-historial">
              <IonText color="medium">{p.sesiones.length} sesiones guardadas</IonText>
              <IonButton size="small" fill="clear" color="danger" onClick={confirmarVaciar}>
                Borrar todo
              </IonButton>
            </div>

            {p.sesiones.map((s) => (
              <IonCard key={s.id} className="tarjeta">
                <IonCardHeader>
                  <IonCardSubtitle>
                    {s.fecha} | {s.horaInicio} - {s.horaFin}
                  </IonCardSubtitle>
                  <IonCardTitle className="titulo-sesion">{formatearDistancia(s.distanciaMetros)}</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <div className="insignias">
                    <IonBadge color="medium">{formatearDuracion(s.duracionSegundos)}</IonBadge>
                    <IonBadge color="medium">{s.coordenadas.length} puntos</IonBadge>
                    {s.motivoFin === 'bateria_baja' && <IonBadge color="warning">Detenida por bateria</IonBadge>}
                  </div>

                  <p className="direccion-etiqueta">Inicio</p>
                  <p className="direccion-texto">{s.direccionInicio}</p>
                  <p className="direccion-etiqueta">Fin</p>
                  <p className="direccion-texto">{s.direccionFin}</p>

                  <div className="acciones-sesion">
                    <IonButton
                      size="small"
                      color="primary"
                      disabled={s.coordenadas.length === 0}
                      onClick={() => p.onVerEnMapa(s)}
                    >
                      Ver en mapa
                    </IonButton>
                    <IonButton
                      size="small"
                      fill="outline"
                      color="medium"
                      onClick={() => setJsonVisible(jsonVisible === s.id ? null : s.id)}
                    >
                      {jsonVisible === s.id ? 'Ocultar JSON' : 'Ver JSON'}
                    </IonButton>
                    <IonButton size="small" fill="clear" color="danger" onClick={() => p.onEliminar(s.id)}>
                      Eliminar
                    </IonButton>
                  </div>

                  {jsonVisible === s.id && <pre className="bloque-json">{JSON.stringify(s, null, 2)}</pre>}
                </IonCardContent>
              </IonCard>
            ))}
          </>
        )}
      </IonContent>
    </IonModal>
  );
}
