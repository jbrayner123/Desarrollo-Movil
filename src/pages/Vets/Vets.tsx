import { useMemo, useState, type CSSProperties } from 'react';
import { useRef } from 'react';
import { IonContent, IonIcon, IonPage, useIonRouter } from '@ionic/react';
import { locationOutline, medkitOutline, shieldCheckmarkOutline, storefrontOutline } from 'ionicons/icons';
import PageHeader from '../../components/Shared/PageHeader';
import CompactHeader from '../../components/Shared/CompactHeader';
import { useScrollHeader } from '../../hooks/useScrollHeader';
import FilterChips, { type ChipOption } from '../../components/Shared/FilterChips';
import EmptyState from '../../components/Shared/EmptyState';
import VetCard from '../../components/Vets/VetCard';
import { useApp } from '../../context/AppContext';
import { useGeolocation } from '../../hooks/useGeolocation';
import { averageRating, recommendation } from '../../services/businesses.service';
import { distanceKm } from '../../helpers/geo';
import { VET_TONES, type Business, type BusinessType } from '../../types';
import styles from './Vets.module.scss';

type Sort = 'cercanas' | 'recomendadas' | 'calificacion';

const TYPES: ChipOption<BusinessType>[] = [
  { value: 'vet', label: 'Veterinarias', icon: medkitOutline },
  { value: 'petshop', label: 'Petshops', icon: storefrontOutline }
];

const SORTS: ChipOption<Sort>[] = [
  { value: 'cercanas', label: 'Más cercanas' },
  { value: 'recomendadas', label: 'Recomendadas' },
  { value: 'calificacion', label: 'Mejor calificadas' }
];

/** Directorio de veterinarias y petshops, ordenado por distancia real o calificacion. */
export default function Vets() {
  // Encabezado que se oculta al bajar y reaparece al subir.
  const scroll = useScrollHeader();
  const contentRef = useRef<HTMLIonContentElement>(null);
  const router = useIonRouter();
  const { businesses, businessesLoading, battery } = useApp();
  const { position } = useGeolocation({ lowPower: battery.lowPower });
  const [type, setType] = useState<BusinessType>('vet');
  const [sort, setSort] = useState<Sort>('cercanas');

  const list = useMemo(() => {
    const withDistance = businesses
      .filter((b) => b.type === type)
      .map((b) => ({ business: b, distance: position ? distanceKm(position, b.location) : null }));
    return withDistance.sort((a, b) => {
      if (sort === 'cercanas' && a.distance !== null && b.distance !== null) return a.distance - b.distance;
      if (sort === 'recomendadas') return (recommendation(b.business) ?? -1) - (recommendation(a.business) ?? -1);
      if (sort === 'calificacion') return (averageRating(b.business) ?? -1) - (averageRating(a.business) ?? -1);
      return Number(b.business.verified) - Number(a.business.verified);
    });
  }, [businesses, type, sort, position]);

  const open = (b: Business) => router.push(`/app/negocio/${b.id}`, 'forward');

  return (
    <IonPage>
      <CompactHeader title="En buenas manos" visible={scroll.compactVisible} contentRef={contentRef} />
      <IonContent fullscreen ref={contentRef} {...scroll.contentProps}>
        <div className="page-pad">
          <PageHeader eyebrow="Servicios" title="En buenas manos." />

          <section className={styles.banner}>
            <IonIcon icon={shieldCheckmarkOutline} className={styles.bannerIcon} aria-hidden="true" />
            <h2>{type === 'vet' ? 'Su salud, primero.' : 'Todo para tu manada.'}</h2>
            <p>
              {type === 'vet'
                ? 'Profesionales de confianza, elegidos por quienes más quieren a sus mascotas.'
                : 'Tiendas de tu zona con alimentos, accesorios y promociones.'}
            </p>
          </section>

          <FilterChips options={TYPES} value={type} onChange={setType} ariaLabel="Tipo de negocio" />
          <FilterChips options={SORTS} value={sort} onChange={setSort} ariaLabel="Ordenar" />

          <div className={styles.sectionHead}>
            <h2>{type === 'vet' ? 'Veterinarias cerca de ti' : 'Petshops cerca de ti'}</h2>
            <span>
              Cali
              <IonIcon icon={locationOutline} aria-hidden="true" />
            </span>
          </div>

          {!businessesLoading && list.length === 0 ? (
            <EmptyState
              icon={type === 'vet' ? medkitOutline : storefrontOutline}
              title="Aún no hay negocios registrados"
              text={type === 'vet' ? 'Cuando una veterinaria cree su cuenta aparecerá aquí.' : 'Cuando un petshop cree su cuenta aparecerá aquí.'}
            />
          ) : (
            list.map(({ business, distance }, i) => (
              <div key={business.id} className="enter-up" style={{ '--i': Math.min(i, 6) } as CSSProperties}>
                <VetCard business={business} tone={VET_TONES[i % VET_TONES.length]} distanceKm={distance} onOpen={open} />
              </div>
            ))
          )}
        </div>
      </IonContent>
    </IonPage>
  );
}
