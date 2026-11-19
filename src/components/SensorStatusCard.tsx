import { IonBadge, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle } from '@ionic/react';
import { UMBRAL_BATERIA_PORCENTAJE } from '../config/constants';
import type { EstadoBateria } from '../types';
import { formatearDistancia } from '../utils/format';

interface Props {
  conectado: boolean;
  tipoConexion: string;
  bateria: EstadoBateria;
  rastreando: boolean;
  puntos: number;
  distanciaMetros: number;
  precision: number | null;
}

/** Fila etiqueta / valor con un IonBadge sobrio. */
function Fila({ etiqueta, valor, color }: { etiqueta: string; valor: string; color: string }) {
  return (
    <div className="fila-estado">
      <span className="fila-etiqueta">{etiqueta}</span>
      <IonBadge color={color}>{valor}</IonBadge>
    </div>
  );
}

/** Resumen del estado de los sensores (red, bateria, GPS) y del recorrido actual. */
export default function SensorStatusCard(p: Props) {
  const textoBateria =
    p.bateria.nivel === null
      ? 'No disponible'
      : `${p.bateria.nivel}%${p.bateria.cargando ? ' - cargando' : ''}`;
  const bateriaBaja = p.bateria.nivel !== null && p.bateria.nivel < UMBRAL_BATERIA_PORCENTAJE;

  return (
    <IonCard className="tarjeta">
      <IonCardHeader>
        <IonCardSubtitle>Estado de sensores</IonCardSubtitle>
      </IonCardHeader>
      <IonCardContent>
        <Fila
          etiqueta="Red"
          valor={p.conectado ? `En linea (${p.tipoConexion})` : 'Sin conexion'}
          color={p.conectado ? 'success' : 'danger'}
        />
        <Fila etiqueta="Bateria" valor={textoBateria} color={bateriaBaja ? 'warning' : 'medium'} />
        <Fila
          etiqueta="Seguimiento"
          valor={p.rastreando ? 'Activo' : 'Detenido'}
          color={p.rastreando ? 'primary' : 'medium'}
        />
        <Fila
          etiqueta="Precision GPS"
          valor={p.precision === null ? 'Sin lectura' : `${p.precision} m`}
          color="medium"
        />
        <Fila etiqueta="Puntos de la ruta" valor={String(p.puntos)} color="medium" />
        <Fila etiqueta="Distancia" valor={formatearDistancia(p.distanciaMetros)} color="medium" />
      </IonCardContent>
    </IonCard>
  );
}
