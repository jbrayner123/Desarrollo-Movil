import { IonIcon } from '@ionic/react';
import { checkmark } from 'ionicons/icons';
import AddressPicker, { type PickedAddress } from '../Map/AddressPicker';
import PhotoPicker from '../Shared/PhotoPicker';
import { SERVICE_OPTIONS } from '../../services/businesses.service';
import type { BusinessType } from '../../types';
import styles from './BusinessForm.module.scss';

export interface BusinessFormValue {
  name: string;
  tagline: string;
  phone: string;
  schedule: string;
  services: string[];
  directions: string;
  place: PickedAddress | null;
  /** data URL nueva o URL ya subida. */
  logo: string | null;
}

export type BusinessFormErrors = Partial<Record<keyof BusinessFormValue, string>>;

export const EMPTY_BUSINESS: BusinessFormValue = {
  name: '',
  tagline: '',
  phone: '',
  schedule: '',
  services: [],
  directions: '',
  place: null,
  logo: null
};

/** Valida los datos del negocio y devuelve los errores por campo. */
export function validateBusiness(v: BusinessFormValue): BusinessFormErrors {
  const e: BusinessFormErrors = {};
  if (v.name.trim().length < 3) e.name = 'Escribe el nombre del negocio.';
  if (!/^[\d\s+()-]{7,}$/.test(v.phone.trim())) e.phone = 'Escribe un teléfono válido.';
  if (!v.schedule.trim()) e.schedule = 'Escribe el horario de atención.';
  if (v.services.length === 0) e.services = 'Elige al menos un servicio.';
  if (!v.place) e.place = 'Ubica el negocio en el mapa.';
  else if (!v.place.address.trim()) e.place = 'Escribe la dirección.';
  return e;
}

interface BusinessFormProps {
  type: BusinessType;
  value: BusinessFormValue;
  errors: BusinessFormErrors;
  onChange: (value: BusinessFormValue) => void;
}

/** Datos de una veterinaria o un petshop: perfil, servicios, logo y direccion. */
export default function BusinessForm({ type, value, errors, onChange }: BusinessFormProps) {
  const set = <K extends keyof BusinessFormValue>(key: K, v: BusinessFormValue[K]) => onChange({ ...value, [key]: v });

  const toggleService = (service: string) =>
    set('services', value.services.includes(service) ? value.services.filter((s) => s !== service) : [...value.services, service]);

  return (
    <div className={styles.form}>
      <section>
        <h3 className={styles.label}>Logo o foto del local</h3>
        <PhotoPicker shape="round" value={value.logo} onChange={(v) => set('logo', v)} hint="Opcional. Ayuda a que te reconozcan." />
      </section>

      <label className={styles.field}>
        <span className={styles.label}>Nombre del negocio</span>
        <input
          className={errors.name ? styles.invalid : ''}
          value={value.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder={type === 'vet' ? 'Veterinaria Huellitas' : 'Petshop La Manada'}
          maxLength={60}
        />
        {errors.name && <small className={styles.error}>{errors.name}</small>}
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Frase corta</span>
        <input value={value.tagline} onChange={(e) => set('tagline', e.target.value)} placeholder="Cuidamos a quien más quieres." maxLength={80} />
      </label>

      <div className={styles.row}>
        <label className={styles.field}>
          <span className={styles.label}>Teléfono</span>
          <input
            className={errors.phone ? styles.invalid : ''}
            value={value.phone}
            onChange={(e) => set('phone', e.target.value)}
            inputMode="tel"
            placeholder="602 555 0101"
            maxLength={20}
          />
          {errors.phone && <small className={styles.error}>{errors.phone}</small>}
        </label>
        <label className={styles.field}>
          <span className={styles.label}>Horario</span>
          <input
            className={errors.schedule ? styles.invalid : ''}
            value={value.schedule}
            onChange={(e) => set('schedule', e.target.value)}
            placeholder="Lun a sáb, 8 a. m. - 6 p. m."
            maxLength={60}
          />
          {errors.schedule && <small className={styles.error}>{errors.schedule}</small>}
        </label>
      </div>

      <section>
        <h3 className={styles.label}>Servicios</h3>
        <div className={styles.services}>
          {SERVICE_OPTIONS[type].map((s) => {
            const active = value.services.includes(s);
            return (
              <button key={s} type="button" className={active ? styles.serviceActive : ''} onClick={() => toggleService(s)} aria-pressed={active}>
                {active && <IonIcon icon={checkmark} aria-hidden="true" />}
                {s}
              </button>
            );
          })}
        </div>
        {errors.services && <small className={styles.error}>{errors.services}</small>}
      </section>

      <section>
        <h3 className={styles.label}>¿Dónde están ubicados?</h3>
        <AddressPicker value={value.place} onChange={(p) => set('place', p)} error={errors.place} />
      </section>

      <label className={styles.field}>
        <span className={styles.label}>Indicaciones (opcional)</span>
        <input value={value.directions} onChange={(e) => set('directions', e.target.value)} placeholder="Local 102, frente al parque" maxLength={80} />
      </label>
    </div>
  );
}
