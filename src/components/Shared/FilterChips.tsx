import { IonIcon } from '@ionic/react';
import styles from './Shared.module.scss';

export interface ChipOption<T extends string> {
  value: T;
  label: string;
  icon?: string;
}

interface FilterChipsProps<T extends string> {
  options: ChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}

/** Fila horizontal de chips de filtro con desplazamiento. El chip activo va en oscuro. */
export default function FilterChips<T extends string>({ options, value, onChange, ariaLabel }: FilterChipsProps<T>) {
  return (
    <div className={styles.chips} role="tablist" aria-label={ariaLabel}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            className={`${styles.chip} ${active ? styles.chipActive : ''}`}
            onClick={() => onChange(opt.value)}
          >
            {opt.icon && <IonIcon icon={opt.icon} aria-hidden="true" />}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
