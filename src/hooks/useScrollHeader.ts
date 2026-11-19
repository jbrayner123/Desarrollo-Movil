import { useCallback, useRef, useState } from 'react';
import type { ScrollDetail } from '@ionic/react';

/** top = cerca del inicio; hidden = bajando; shown = subiendo despues de haber bajado. */
export type ScrollHeaderState = 'top' | 'hidden' | 'shown';

/** Desplazamiento minimo para cambiar de estado: evita parpadeos con movimientos pequenos. */
const THRESHOLD = 8;

/**
 * Encabezado que se oculta al desplazarse hacia abajo y reaparece al subir,
 * como en la mayoria de apps moviles. Se conecta a IonContent con `contentProps`.
 * @param revealAfter pixeles desde arriba a partir de los cuales aplica el efecto.
 */
export function useScrollHeader(revealAfter = 140) {
  const [state, setState] = useState<ScrollHeaderState>('top');
  const lastY = useRef(0);

  const onIonScroll = useCallback(
    (e: CustomEvent<ScrollDetail>) => {
      const y = e.detail.scrollTop;
      const dy = y - lastY.current;
      if (y < revealAfter) {
        setState('top');
        lastY.current = y;
      } else if (dy > THRESHOLD) {
        setState('hidden');
        lastY.current = y;
      } else if (dy < -THRESHOLD) {
        setState('shown');
        lastY.current = y;
      }
    },
    [revealAfter]
  );

  return {
    state,
    /** Barra compacta visible: solo al subir despues de haber pasado el titulo grande. */
    compactVisible: state === 'shown',
    /** Encabezado fijo oculto: solo mientras se baja. */
    headerHidden: state === 'hidden',
    contentProps: { scrollEvents: true, onIonScroll }
  };
}
