import { useEffect } from 'react';
import { CircleMarker, MapContainer, Polyline, TileLayer, useMap } from 'react-leaflet';
import { latLngBounds } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CENTRO_POR_DEFECTO, ZOOM_POR_DEFECTO } from '../config/constants';
import type { Coordenada } from '../types';

interface Props {
  posicion: Coordenada | null;
  rutaActiva: Coordenada[];
  /** Ruta de una sesion del historial que se quiere revisar sobre el mapa. */
  rutaHistorial: Coordenada[] | null;
  seguirPosicion: boolean;
  /** Cambiar este valor fuerza la recarga de las teselas del mapa. */
  versionTeselas: number;
}

const COLOR_PRIMARIO = '#1f2a44';
const COLOR_HISTORIAL = '#6b7280';

const aLatLng = (c: Coordenada): [number, number] => [c.lat, c.lng];

/** Controla el viewport: ajusta tamano en Ionic, sigue al usuario y encuadra el historial. */
function ControladorMapa({ posicion, rutaHistorial, seguirPosicion, versionTeselas }: Props) {
  const map = useMap();

  // IonContent termina de medir despues del primer render: se recalcula el tamano.
  useEffect(() => {
    const id = window.setTimeout(() => map.invalidateSize(), 300);
    return () => window.clearTimeout(id);
  }, [map, versionTeselas]);

  useEffect(() => {
    if (posicion && seguirPosicion) {
      map.setView(aLatLng(posicion), Math.max(map.getZoom(), ZOOM_POR_DEFECTO));
    }
  }, [map, posicion, seguirPosicion]);

  useEffect(() => {
    if (rutaHistorial && rutaHistorial.length > 0) {
      map.fitBounds(latLngBounds(rutaHistorial.map(aLatLng)), { padding: [32, 32], maxZoom: 18 });
    }
  }, [map, rutaHistorial]);

  return null;
}

/** Mapa Leaflet con estilo plano: marcador circular y polilineas solidas. */
export default function LeafletMap(props: Props) {
  const { posicion, rutaActiva, rutaHistorial, versionTeselas } = props;

  return (
    <MapContainer
      center={posicion ? aLatLng(posicion) : CENTRO_POR_DEFECTO}
      zoom={ZOOM_POR_DEFECTO}
      className="mapa"
      zoomControl
    >
      <TileLayer
        key={versionTeselas}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {rutaHistorial && rutaHistorial.length > 1 && (
        <Polyline
          positions={rutaHistorial.map(aLatLng)}
          pathOptions={{ color: COLOR_HISTORIAL, weight: 4, dashArray: '6 6' }}
        />
      )}

      {rutaActiva.length > 1 && (
        <Polyline positions={rutaActiva.map(aLatLng)} pathOptions={{ color: COLOR_PRIMARIO, weight: 5 }} />
      )}

      {posicion && (
        <CircleMarker
          center={aLatLng(posicion)}
          radius={8}
          pathOptions={{ color: '#ffffff', weight: 3, fillColor: COLOR_PRIMARIO, fillOpacity: 1 }}
        />
      )}

      <ControladorMapa {...props} />
    </MapContainer>
  );
}
