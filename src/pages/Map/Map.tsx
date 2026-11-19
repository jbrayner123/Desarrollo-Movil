import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useRef } from 'react';
import { IonContent, IonIcon, IonPage, IonSpinner, useIonRouter } from '@ionic/react';
import { batteryDeadOutline, chevronForward, locateOutline, locationOutline, medkitOutline, pawOutline, storefrontOutline } from 'ionicons/icons';
import PageHeader from '../../components/Shared/PageHeader';
import CompactHeader from '../../components/Shared/CompactHeader';
import { useScrollHeader } from '../../hooks/useScrollHeader';
import FilterChips, { type ChipOption } from '../../components/Shared/FilterChips';
import EmptyState from '../../components/Shared/EmptyState';
import MapView from '../../components/Map/MapView';
import { useApp } from '../../context/AppContext';
import { CALI_CENTER, useGeolocation } from '../../hooks/useGeolocation';
import { useRealtime } from '../../hooks/useRealtime';
import { subscribeMapPosts } from '../../services/posts.service';
import { reverseGeocode, shortLabel } from '../../services/opencagedata';
import { isAbortError } from '../../helpers/httpErrors';
import { distanceKm } from '../../helpers/geo';
import { formatDistance, timeAgo } from '../../helpers/format';
import type { MapPoint, MapPointKind, Post } from '../../types';
import styles from './Map.module.scss';

type MapFilter = 'todo' | MapPointKind;

const FILTERS: ChipOption<MapFilter>[] = [
  { value: 'todo', label: 'Todo' },
  { value: 'perdido', label: 'Perdidos', icon: locationOutline },
  { value: 'paseo', label: 'Paseos', icon: pawOutline },
  { value: 'veterinaria', label: 'Veterinarias', icon: medkitOutline },
  { value: 'petshop', label: 'Petshops', icon: storefrontOutline }
];

const KIND_LABEL: Record<MapPointKind, string> = {
  perdido: 'Mascota perdida',
  paseo: 'Paseo',
  veterinaria: 'Veterinaria',
  petshop: 'Petshop'
};

const KIND_ICON: Record<MapPointKind, string> = {
  perdido: locationOutline,
  paseo: pawOutline,
  veterinaria: medkitOutline,
  petshop: storefrontOutline
};

/** Solo se muestran reportes y paseos de los ultimos 14 dias. */
const RECENT_MS = 14 * 24 * 3600 * 1000;

/**
 * Mapa de la comunidad con la ubicacion real del usuario.
 * Con bateria baja (useDevice) desactiva el seguimiento continuo del GPS.
 */
export default function MapPage() {
  // Encabezado que se oculta al bajar y reaparece al subir.
  const scroll = useScrollHeader();
  const contentRef = useRef<HTMLIonContentElement>(null);
  const router = useIonRouter();
  const { businesses, battery, isOnline } = useApp();
  const { position, error: geoError, loading: locating, locate } = useGeolocation({ watch: true, lowPower: battery.lowPower });
  const { data: mapPosts } = useRealtime<Post[]>((onData, onError) => subscribeMapPosts(onData, onError), [], []);
  const [filter, setFilter] = useState<MapFilter>('todo');
  const [focus, setFocus] = useState<MapPoint | null>(null);
  const [placeLabel, setPlaceLabel] = useState<string | null>(null);

  // Direccion legible de la ubicacion actual (cancelable al desmontar o al moverse).
  const roundedKey = position ? `${position.lat.toFixed(3)},${position.lng.toFixed(3)}` : '';
  useEffect(() => {
    if (!position || !isOnline) return;
    const controller = new AbortController();
    reverseGeocode(position, controller.signal)
      .then((a) => a && setPlaceLabel(shortLabel(a)))
      .catch((e) => {
        if (!isAbortError(e)) setPlaceLabel(null);
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundedKey, isOnline]);

  const points = useMemo<MapPoint[]>(() => {
    const now = Date.now();
    const fromPosts: MapPoint[] = mapPosts
      .filter((p) => now - new Date(p.createdAt).getTime() < RECENT_MS)
      .map((p) => ({
        id: p.id,
        kind: p.category as 'perdido' | 'paseo',
        title: p.category === 'perdido' ? p.petName ?? 'Mascota perdida' : p.authorName,
        subtitle: `${p.location!.label} · ${timeAgo(p.createdAt)}`,
        lat: p.location!.lat,
        lng: p.location!.lng,
        link: '/app/inicio'
      }));
    const fromBusinesses: MapPoint[] = businesses.map((b) => ({
      id: b.id,
      kind: b.type === 'vet' ? 'veterinaria' : 'petshop',
      title: b.name,
      subtitle: b.neighborhood ? `${b.neighborhood} · ${b.address}` : b.address,
      lat: b.location.lat,
      lng: b.location.lng,
      link: `/app/negocio/${b.id}`
    }));
    const all = [...fromPosts, ...fromBusinesses].filter((p) => filter === 'todo' || p.kind === filter);
    const origin = position ?? CALI_CENTER;
    return all.sort((a, b) => distanceKm(origin, a) - distanceKm(origin, b));
  }, [mapPosts, businesses, filter, position]);

  const center = position ?? CALI_CENTER;

  return (
    <IonPage>
      <CompactHeader title="Explora tu zona" visible={scroll.compactVisible} contentRef={contentRef} />
      <IonContent fullscreen ref={contentRef} {...scroll.contentProps}>
        <div className="page-pad">
          <PageHeader
            eyebrow="Mapa"
            title="Explora tu zona."
            action={
              <button type="button" className={styles.locateButton} onClick={() => { setFocus(null); locate(); }} aria-label="Centrar en mi ubicación">
                {locating ? <IonSpinner name="dots" /> : <IonIcon icon={locateOutline} />}
              </button>
            }
          >
            <span className={styles.meta}>
              <IonIcon icon={locationOutline} aria-hidden="true" />
              {placeLabel ?? (position ? 'Tu ubicación' : 'Cali, Colombia')}
            </span>
          </PageHeader>

          {battery.lowPower && (
            <div className={styles.notice}>
              <IonIcon icon={batteryDeadOutline} aria-hidden="true" />
              Batería al {battery.level}%: el seguimiento en vivo está pausado para ahorrar energía.
            </div>
          )}
          {geoError && <div className={styles.notice}>{geoError}</div>}

          <FilterChips options={FILTERS} value={filter} onChange={setFilter} ariaLabel="Filtrar el mapa" />

          <div className={styles.mapCard}>
            <MapView center={center} user={position} points={points} focus={focus} onSelect={setFocus} />
            <div className={styles.legend} aria-hidden="true">
              <span><i className={styles.dotLost} />Perdidos</span>
              <span><i className={styles.dotWalk} />Paseos</span>
              <span><i className={styles.dotVet} />Veterinarias</span>
              <span><i className={styles.dotShop} />Petshops</span>
            </div>
          </div>

          <div className={styles.sectionHead}>
            <h2>Cerca de ti</h2>
            <span>
              {points.length} {points.length === 1 ? 'lugar' : 'lugares'}
            </span>
          </div>

          {points.length === 0 ? (
            <EmptyState icon={locationOutline} title="Nada cerca por ahora" text="Cuando la comunidad publique paseos o reportes con ubicación, aparecerán aquí." />
          ) : (
            <ul className={styles.list}>
              {points.map((p, i) => (
                <li key={p.id} className={`${styles.placeRow} ${focus?.id === p.id ? styles.placeActive : ''} enter-up`} style={{ '--i': Math.min(i, 6) } as CSSProperties}>
                  <button type="button" className={styles.place} onClick={() => setFocus(p)} aria-label={`Ver ${p.title} en el mapa`}>
                    <span className={`${styles.kind} ${styles[p.kind]}`}>
                      <IonIcon icon={KIND_ICON[p.kind]} />
                    </span>
                    <span className={styles.placeText}>
                      <small>
                        {KIND_LABEL[p.kind]}
                        {position && ` · ${formatDistance(distanceKm(position, p))}`}
                      </small>
                      <strong>{p.title}</strong>
                      <span>{p.subtitle}</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    className={styles.go}
                    aria-label={`Abrir ${p.title}`}
                    onClick={() => router.push(p.link, p.link === '/app/inicio' ? 'none' : 'forward', p.link === '/app/inicio' ? 'replace' : 'push')}
                  >
                    <IonIcon icon={chevronForward} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
}
