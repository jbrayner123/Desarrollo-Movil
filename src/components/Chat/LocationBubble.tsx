import { memo } from 'react';
import { IonIcon } from '@ionic/react';
import { locationOutline, navigateOutline } from 'ionicons/icons';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import { divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Message } from '../../types';
import { directionsUrl } from '../../helpers/geo';
import { messageTime } from '../../helpers/format';
import styles from './LocationBubble.module.scss';

const PIN = divIcon({ className: '', html: `<span class="${styles.pin}"></span>`, iconSize: [24, 24], iconAnchor: [12, 24] });

/**
 * Mensaje de ubicacion compartida: mini mapa fijo (sin gestos, para no interferir con
 * el desplazamiento del chat), direccion y boton para abrir la ruta en Google Maps.
 */
function LocationBubble({ message, mine }: { message: Message; mine: boolean }) {
  const loc = message.location;
  if (!loc) return null;

  return (
    <div className={`${styles.row} ${mine ? styles.mine : styles.theirs}`}>
      <div className={`${styles.card} ${message.pending ? styles.pending : ''}`}>
        <div className={styles.map}>
          <MapContainer
            center={[loc.lat, loc.lng]}
            zoom={16}
            className={styles.leaflet}
            zoomControl={false}
            attributionControl={false}
            dragging={false}
            scrollWheelZoom={false}
            doubleClickZoom={false}
            touchZoom={false}
            boxZoom={false}
            keyboard={false}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[loc.lat, loc.lng]} icon={PIN} interactive={false} />
          </MapContainer>
        </div>
        <div className={styles.info}>
          <p className={styles.label}>
            <IonIcon icon={locationOutline} aria-hidden="true" />
            <span>{loc.label}</span>
          </p>
          <a className={styles.directions} href={directionsUrl(loc)} target="_blank" rel="noopener noreferrer">
            <IonIcon icon={navigateOutline} aria-hidden="true" />
            Cómo llegar
          </a>
          <time dateTime={message.createdAt}>{message.pending ? 'Enviando' : messageTime(message.createdAt)}</time>
        </div>
      </div>
    </div>
  );
}

export default memo(LocationBubble);
