import { useEffect, useState, type FormEvent } from 'react';
import {
  IonButton,
  IonChip,
  IonCol,
  IonContent,
  IonFooter,
  IonGrid,
  IonHeader,
  IonLabel,
  IonPage,
  IonRow,
  IonSearchbar,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
  useIonViewDidEnter,
  useIonViewWillLeave
} from '@ionic/react';

import GifCard from '../components/GifCard';
import { useGifSearch } from '../hooks/useGifSearch';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { hasGiphyApiKey } from '../api/giphyClient';

/** Tiempo de espera tras la ultima tecla antes de buscar. */
const DEBOUNCE_MS = 450;
const SUGGESTIONS = ['smile', 'cats', 'coding', 'football', 'coffee', 'thank you'];

/**
 * Pagina principal del Challenge 10: busqueda de GIFs con la API de GIPHY.
 *
 * Flujo:
 * - El texto del IonSearchbar se busca tras DEBOUNCE_MS sin teclear, o al pulsar
 *   Enter o el boton Buscar.
 * - useGifSearch cancela con AbortController la peticion anterior en cada busqueda
 *   nueva y al salir de la vista.
 * - La vista muestra un estado a la vez: inicial, cargando, error, vacio o resultados.
 */
export default function GiphySearch() {
  const [term, setTerm] = useState('');
  const debouncedTerm = useDebouncedValue(term, DEBOUNCE_MS);
  const {
    query,
    gifs,
    loading,
    loadingMore,
    error,
    isEmpty,
    totalCount,
    hasMore,
    search,
    loadMore,
    retry,
    cancel
  } = useGifSearch();

  // Busqueda automatica cuando el usuario deja de escribir.
  useEffect(() => {
    search(debouncedTerm);
  }, [debouncedTerm, search]);

  // Al salir de la vista se cancela la peticion pendiente; al volver se retoma.
  useIonViewWillLeave(() => cancel());
  useIonViewDidEnter(() => {
    if (term.trim()) search(term);
  });

  /** Enter o boton Buscar: busca de inmediato sin esperar el debounce. */
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    search(term);
  };

  const applySuggestion = (value: string) => {
    setTerm(value);
    search(value);
  };

  const showInitial = !query && !loading;
  const showResults = gifs.length > 0;

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonTitle>Buscador GIPHY</IonTitle>
        </IonToolbar>
        <IonToolbar className="search-toolbar">
          <form className="search-form" onSubmit={handleSubmit} role="search">
            <IonSearchbar
              value={term}
              placeholder="Buscar GIFs"
              debounce={0}
              enterkeyhint="search"
              inputmode="search"
              maxlength={50}
              aria-label="Termino de busqueda"
              onIonInput={(e) => setTerm(e.detail.value ?? '')}
              onIonClear={() => setTerm('')}
            />
            <IonButton type="submit" color="primary" disabled={!term.trim() || loading}>
              Buscar
            </IonButton>
          </form>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div className="page-container">
          {!hasGiphyApiKey() && (
            <div className="notice" role="alert">
              <strong>API Key no configurada.</strong> Copia .env.example como .env y define VITE_GIPHY_API_KEY.
            </div>
          )}

          {/* Estado inicial: sin busqueda */}
          {showInitial && (
            <section className="state-block">
              <h2 className="state-title">Busca un GIF</h2>
              <p className="state-text">Escribe un termino en el campo superior o prueba con una sugerencia.</p>
              <div className="suggestions">
                {SUGGESTIONS.map((s) => (
                  <IonChip key={s} outline onClick={() => applySuggestion(s)}>
                    <IonLabel>{s}</IonLabel>
                  </IonChip>
                ))}
              </div>
            </section>
          )}

          {/* Cargando la primera pagina */}
          {loading && (
            <section className="state-block" aria-live="polite">
              <IonSpinner name="crescent" color="primary" />
              <p className="state-text">Buscando GIFs para "{query}"...</p>
            </section>
          )}

          {/* Error sin resultados previos */}
          {error && !showResults && (
            <section className="state-block" role="alert">
              <h2 className="state-title">No se pudo completar la busqueda</h2>
              <p className="state-text">{error}</p>
              <IonButton color="primary" onClick={retry}>
                Reintentar
              </IonButton>
            </section>
          )}

          {/* Busqueda sin resultados */}
          {isEmpty && (
            <section className="state-block">
              <h2 className="state-title">Sin resultados</h2>
              <p className="state-text">
                No se encontraron GIFs para "{query}". Revisa la ortografia o intenta con otro termino en ingles.
              </p>
            </section>
          )}

          {/* Resultados */}
          {showResults && (
            <>
              <p className="results-summary">
                Mostrando {gifs.length} de {totalCount.toLocaleString('es-CO')} resultados para "{query}"
              </p>

              <IonGrid className="gif-grid">
                <IonRow>
                  {gifs.map((gif) => (
                    <IonCol key={gif.id} size="6" sizeMd="4" sizeLg="3">
                      <GifCard gif={gif} />
                    </IonCol>
                  ))}
                </IonRow>
              </IonGrid>

              {error && (
                <div className="notice" role="alert">
                  <span>{error}</span>
                  <IonButton size="small" fill="clear" color="dark" onClick={retry}>
                    Reintentar
                  </IonButton>
                </div>
              )}

              {hasMore && !error && (
                <div className="load-more">
                  <IonButton fill="outline" color="dark" disabled={loadingMore} onClick={loadMore}>
                    {loadingMore ? <IonSpinner name="dots" /> : 'Cargar mas'}
                  </IonButton>
                </div>
              )}
            </>
          )}
        </div>
      </IonContent>

      <IonFooter className="ion-no-border">
        <IonToolbar className="footer-toolbar">
          <IonText color="medium">
            <p className="attribution">Resultados proporcionados por GIPHY</p>
          </IonText>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
}
