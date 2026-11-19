import { memo } from 'react';
import { IonCard } from '@ionic/react';
import type { Gif } from '../services/giphy.service';

interface GifCardProps {
  gif: Gif;
}

/**
 * Tarjeta plana de un GIF. Reserva el alto con aspect-ratio para que la
 * cuadricula no salte mientras cargan las imagenes, y enlaza al GIF en GIPHY.
 */
function GifCard({ gif }: GifCardProps) {
  return (
    <IonCard className="gif-card">
      <a href={gif.url} target="_blank" rel="noopener noreferrer" className="gif-card__link" title={gif.title}>
        <div className="gif-card__media" style={{ aspectRatio: `${gif.width} / ${gif.height}` }}>
          <img src={gif.imageUrl} alt={gif.title} loading="lazy" decoding="async" />
        </div>
        <p className="gif-card__title">{gif.title}</p>
      </a>
    </IonCard>
  );
}

export default memo(GifCard);
