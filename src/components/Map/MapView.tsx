import { useEffect } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { GeoPoint, MapPoint, MapPointKind } from '../../types';
import styles from './MapView.module.scss';

interface MapViewProps {
  center: GeoPoint;
  user: GeoPoint | null;
  points: MapPoint[];
  /** Punto elegido en la lista: el mapa vuela hacia el. */
  focus?: MapPoint | null;
  onSelect: (point: MapPoint) => void;
}

const pin = (cls: string) => divIcon({ className: '', html: `<span class="${styles.pin} ${cls}"></span>`, iconSize: [22, 22], iconAnchor: [11, 11] });

/** Marcadores planos: circulo de color con borde blanco, sin imagenes externas. */
const ICONS: Record<MapPointKind, ReturnType<typeof divIcon>> = {
  perdido: pin(styles.pinLost),
  paseo: pin(styles.pinWalk),
  veterinaria: pin(styles.pinVet),
  petshop: pin(styles.pinShop)
};
const USER_ICON = divIcon({ className: '', html: `<span class="${styles.user}"><span></span></span>`, iconSize: [28, 28], iconAnchor: [14, 14] });

/** Ajusta el tamano dentro de Ionic, sigue el centro y anima el foco. */
function Controller({ center, focus }: { center: GeoPoint; focus?: MapPoint | null }) {
  const map = useMap();

  useEffect(() => {
    const id = window.setTimeout(() => map.invalidateSize(), 250);
    return () => window.clearTimeout(id);
  }, [map]);

  useEffect(() => {
    if (!focus) map.setView([center.lat, center.lng], map.getZoom());
  }, [map, center.lat, center.lng, focus]);

  useEffect(() => {
    if (focus) map.flyTo([focus.lat, focus.lng], 16, { duration: 0.6 });
  }, [map, focus]);

  return null;
}

export default function MapView({ center, user, points, focus, onSelect }: MapViewProps) {
  return (
    <MapContainer center={[center.lat, center.lng]} zoom={14} className={styles.map} zoomControl={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {user && <Marker position={[user.lat, user.lng]} icon={USER_ICON} />}
      {points.map((p) => (
        <Marker key={p.id} position={[p.lat, p.lng]} icon={ICONS[p.kind]} eventHandlers={{ click: () => onSelect(p) }}>
          <Popup closeButton={false}>
            <strong>{p.title}</strong>
            <br />
            {p.subtitle}
          </Popup>
        </Marker>
      ))}
      <Controller center={center} focus={focus} />
    </MapContainer>
  );
}
