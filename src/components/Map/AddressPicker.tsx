import { useEffect, useMemo, useRef, useState } from 'react';
import { IonIcon, IonSpinner } from '@ionic/react';
import { locateOutline, locationOutline, searchOutline } from 'ionicons/icons';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import { divIcon, type Marker as LeafletMarker } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAddressSearch } from '../../hooks/useAddressSearch';
import { CALI_CENTER } from '../../hooks/useGeolocation';
import { Geolocation } from '@capacitor/geolocation';
import { reverseGeocode, type AddressResult } from '../../services/opencagedata';
import { isAbortError } from '../../helpers/httpErrors';
import type { GeoPoint } from '../../types';
import styles from './AddressPicker.module.scss';

export interface PickedAddress {
  address: string;
  neighborhood: string;
  location: GeoPoint;
}

interface AddressPickerProps {
  value: PickedAddress | null;
  onChange: (value: PickedAddress) => void;
  error?: string;
}

const PIN = divIcon({ className: '', html: `<span class="${styles.pin}"></span>`, iconSize: [30, 30], iconAnchor: [15, 30] });

/** Centra el mini mapa cuando cambia la ubicacion elegida. */
function Recenter({ point }: { point: GeoPoint }) {
  const map = useMap();
  useEffect(() => {
    map.setView([point.lat, point.lng], Math.max(map.getZoom(), 16));
  }, [map, point.lat, point.lng]);
  useEffect(() => {
    const id = window.setTimeout(() => map.invalidateSize(), 250);
    return () => window.clearTimeout(id);
  }, [map]);
  return null;
}

const fromResult = (r: AddressResult): PickedAddress => ({
  address: r.street,
  neighborhood: r.neighborhood,
  location: { lat: r.lat, lng: r.lng }
});

/**
 * Selector de direccion para negocios, con tres formas combinables:
 * 1. Escribir la direccion: OpenCage sugiere coincidencias en Cali.
 * 2. Usar la ubicacion actual: GPS + geocodificacion inversa.
 * 3. Arrastrar el pin del mini mapa para ajustar el punto exacto.
 */
export default function AddressPicker({ value, onChange, error }: AddressPickerProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const reverseController = useRef<AbortController | null>(null);
  const { results, loading } = useAddressSearch(query, open);

  // Cancela cualquier geocodificacion pendiente al desmontar.
  useEffect(() => () => reverseController.current?.abort(), []);

  /** Convierte un punto en direccion y avisa si queda fuera de Cali. */
  const resolvePoint = async (point: GeoPoint) => {
    reverseController.current?.abort();
    const controller = new AbortController();
    reverseController.current = controller;
    setResolving(true);
    try {
      const result = await reverseGeocode(point, controller.signal);
      if (!result) {
        onChange({ address: value?.address ?? '', neighborhood: value?.neighborhood ?? '', location: point });
        return;
      }
      onChange({ ...fromResult(result), location: point });
      setNotice(result.inCali ? null : 'Esta ubicación parece estar fuera de Cali. Revisa el punto en el mapa.');
    } catch (e) {
      if (!isAbortError(e)) {
        onChange({ address: value?.address ?? '', neighborhood: value?.neighborhood ?? '', location: point });
        setNotice('No se pudo obtener la dirección. Puedes escribirla abajo.');
      }
    } finally {
      if (!controller.signal.aborted) setResolving(false);
    }
  };

  const useMyLocation = async () => {
    setLocating(true);
    setNotice(null);
    try {
      try {
        const perm = await Geolocation.checkPermissions();
        if (perm.location !== 'granted') await Geolocation.requestPermissions();
      } catch {
        /* navegador: pregunta al leer la posicion */
      }
      const p = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 15_000 });
      await resolvePoint({ lat: p.coords.latitude, lng: p.coords.longitude });
    } catch {
      setNotice('No pudimos obtener tu ubicación. Activa el GPS o escribe la dirección.');
    } finally {
      setLocating(false);
    }
  };

  const pick = (r: AddressResult) => {
    onChange(fromResult(r));
    setQuery('');
    setOpen(false);
    setNotice(r.inCali ? null : 'Esta dirección parece estar fuera de Cali.');
  };

  const markerHandlers = useMemo(
    () => ({
      dragend(e: { target: LeafletMarker }) {
        const p = e.target.getLatLng();
        resolvePoint({ lat: p.lat, lng: p.lng });
      }
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [value]
  );

  const point = value?.location ?? CALI_CENTER;

  return (
    <div className={styles.picker}>
      <div className={`${styles.search} ${error ? styles.searchError : ''}`}>
        <IonIcon icon={searchOutline} aria-hidden="true" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Escribe la dirección, por ejemplo Calle 5 # 34-12"
          aria-label="Buscar dirección"
        />
        {loading && <IonSpinner name="dots" />}
      </div>

      {open && results.length > 0 && (
        <ul className={styles.results} role="listbox">
          {results.map((r) => (
            <li key={`${r.lat},${r.lng}`}>
              <button type="button" onClick={() => pick(r)}>
                <IonIcon icon={locationOutline} aria-hidden="true" />
                <span>
                  <strong>{r.street}</strong>
                  <small>{r.formatted}</small>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <button type="button" className={styles.locate} onClick={useMyLocation} disabled={locating}>
        {locating ? <IonSpinner name="dots" /> : <IonIcon icon={locateOutline} aria-hidden="true" />}
        Usar mi ubicación actual
      </button>

      <div className={styles.map}>
        <MapContainer center={[point.lat, point.lng]} zoom={value ? 16 : 13} zoomControl={false} attributionControl={false} className={styles.leaflet}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {value && <Marker position={[point.lat, point.lng]} icon={PIN} draggable eventHandlers={markerHandlers} />}
          <Recenter point={point} />
        </MapContainer>
        {!value && <p className={styles.mapHint}>Busca la dirección o usa tu ubicación para ubicar el negocio.</p>}
        {resolving && (
          <span className={styles.resolving}>
            <IonSpinner name="dots" />
          </span>
        )}
      </div>
      {value && <p className={styles.dragHint}>Si el punto no quedó exacto, arrastra el pin hasta la entrada del negocio.</p>}

      {value && (
        <div className={styles.fields}>
          <label>
            Dirección
            <input value={value.address} onChange={(e) => onChange({ ...value, address: e.target.value })} maxLength={120} />
          </label>
          <label>
            Barrio
            <input value={value.neighborhood} onChange={(e) => onChange({ ...value, neighborhood: e.target.value })} maxLength={60} />
          </label>
        </div>
      )}

      {(notice || error) && <p className={styles.notice}>{error ?? notice}</p>}
    </div>
  );
}
