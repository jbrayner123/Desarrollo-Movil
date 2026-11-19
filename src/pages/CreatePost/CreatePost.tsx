import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { IonContent, IonFooter, IonIcon, IonPage, IonSpinner, useIonRouter, useIonToast } from '@ionic/react';
import { close, cloudOfflineOutline, documentTextOutline, locationOutline, refreshOutline, trashOutline } from 'ionicons/icons';
import DetailHeader from '../../components/Shared/DetailHeader';
import PhotoPicker from '../../components/Shared/PhotoPicker';
import { CATEGORIES_BY_ROLE, CATEGORY_META } from '../../components/Feed/categories';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useHaptics } from '../../hooks/useHaptics';
import { deleteDraft, saveDraft, useDrafts } from '../../hooks/useDexie';
import { Geolocation } from '@capacitor/geolocation';
import { reverseGeocode, shortLabel } from '../../services/opencagedata';
import { resolveImage } from '../../services/cloudinary';
import { createPost } from '../../services/posts.service';
import { maxLength, required, validate } from '../../helpers/validators';
import { isAbortError, toUserMessage } from '../../helpers/httpErrors';
import { timeAgo } from '../../helpers/format';
import type { Draft } from '../../lib/db';
import type { PostCategory, PostLocation } from '../../types';
import styles from './CreatePost.module.scss';

const MAX_TEXT = 500;

const PLACEHOLDERS: Record<PostCategory, string> = {
  momento: 'Escribe algo sobre la foto (opcional).',
  paseo: 'Lugar, hora y a quién quieres invitar.',
  perdido: 'Dónde y cuándo se perdió, cómo es y cómo contactarte.',
  tip: 'Comparte un consejo útil para la comunidad.',
  aviso: 'Jornadas de vacunación, horarios especiales o noticias de la clínica.',
  promo: 'Describe la promoción, el precio y hasta cuándo es válida.'
};

/**
 * Crear publicacion.
 * - Foto con @capacitor/camera, subida a Cloudinary al publicar.
 * - Ubicacion con @capacitor/geolocation + OpenCage (direccion legible).
 * - Sin conexion se guarda como borrador en Dexie para publicarlo despues.
 */
export default function CreatePost() {
  const router = useIonRouter();
  const [presentToast] = useIonToast();
  const haptics = useHaptics();
  const { user, identity } = useAuth();
  const { isOnline } = useApp();
  const drafts = useDrafts();

  const allowed = CATEGORIES_BY_ROLE[user?.role ?? 'owner'];
  const [category, setCategory] = useState<PostCategory>(allowed[0]);
  const [text, setText] = useState('');
  const [petName, setPetName] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [location, setLocation] = useState<PostLocation | null>(null);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const geoController = useRef<AbortController | null>(null);

  const needsLocation = category === 'paseo' || category === 'perdido';

  /** Vuelve al feed con la transicion nativa de regreso (desde el feed se llega aqui). */
  const goBackToFeed = () => (router.canGoBack() ? router.goBack() : router.push('/app/inicio', 'root', 'replace'));

  /** GPS -> coordenadas -> direccion legible con OpenCage. */
  const locate = async () => {
    geoController.current?.abort();
    const controller = new AbortController();
    geoController.current = controller;
    setLocating(true);
    try {
      try {
        const perm = await Geolocation.checkPermissions();
        if (perm.location !== 'granted') await Geolocation.requestPermissions();
      } catch {
        /* navegador */
      }
      const p = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 15_000 });
      const point = { lat: p.coords.latitude, lng: p.coords.longitude };
      let label = 'Ubicación actual';
      try {
        const address = isOnline ? await reverseGeocode(point, controller.signal) : null;
        if (address) label = shortLabel(address);
      } catch (e) {
        if (isAbortError(e)) return;
      }
      if (!controller.signal.aborted) setLocation({ ...point, label });
    } catch {
      if (!controller.signal.aborted) setError('No se pudo obtener tu ubicación. Activa el GPS e intenta de nuevo.');
    } finally {
      if (!controller.signal.aborted) setLocating(false);
    }
  };

  // Ubicacion automatica para paseos y mascotas perdidas.
  useEffect(() => {
    if (needsLocation && !location) locate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsLocation]);

  useEffect(() => () => geoController.current?.abort(), []);

  // En un "momento" la foto es obligatoria y el texto opcional; en el resto, al reves.
  const validationError = (): string | null =>
    (category === 'momento'
      ? !photo
        ? 'Agrega una foto para compartir tu momento.'
        : validate(text, maxLength(MAX_TEXT, 'La descripción'))
      : validate(text, required('La descripción'), maxLength(MAX_TEXT, 'La descripción'))) ??
    (category === 'perdido' ? validate(petName, required('El nombre de la mascota')) : null) ??
    (category === 'perdido' && !photo ? 'Agrega una foto para ayudar a reconocer a la mascota.' : null);

  /** Publica en Firestore: sube la foto primero si hay una. */
  const publishData = async (data: { category: PostCategory; text: string; petName?: string; image?: string | null; location?: PostLocation | null }) => {
    if (!user || !identity) return;
    const imageUrl = await resolveImage(data.image, 'posts');
    await createPost(
      user,
      {
        category: data.category,
        text: data.text,
        petName: data.category === 'perdido' ? data.petName : undefined,
        imageUrl: imageUrl || undefined,
        location: data.location ?? undefined
      },
      identity.name,
      identity.photo
    );
  };

  const publish = async () => {
    const message = validationError();
    if (message) {
      setError(message);
      haptics.warning();
      return;
    }
    setError(null);

    // Sin conexion: se guarda como borrador local.
    if (!isOnline) {
      await saveDraft({ category, text, petName, imageDataUrl: photo ?? undefined, location: location ?? undefined, createdAt: new Date().toISOString() });
      haptics.success();
      presentToast({ message: 'Sin conexión: guardamos tu publicación como borrador.', duration: 2200, position: 'top' });
      goBackToFeed();
      return;
    }

    try {
      setStatus(photo ? 'Subiendo la foto...' : 'Publicando...');
      await publishData({ category, text, petName, image: photo, location });
      haptics.success();
      presentToast({ message: 'Publicación compartida con tu comunidad.', duration: 1800, position: 'top' });
      goBackToFeed();
    } catch (e) {
      setError(toUserMessage(e));
    } finally {
      setStatus(null);
    }
  };

  const publishDraft = async (draft: Draft) => {
    if (!isOnline || !draft.id) return;
    try {
      setStatus('Publicando borrador...');
      await publishData({ category: draft.category, text: draft.text, petName: draft.petName, image: draft.imageDataUrl, location: draft.location });
      await deleteDraft(draft.id);
      haptics.success();
      presentToast({ message: 'Borrador publicado.', duration: 1600, position: 'top' });
    } catch (e) {
      setError(toUserMessage(e));
    } finally {
      setStatus(null);
    }
  };

  const busy = status !== null;

  return (
    <IonPage>
      <DetailHeader fallback="/app/inicio" title="Nueva publicación" backIcon={close} backLabel="Cerrar" />

      <IonContent>
        <div className={styles.page}>
          {!isOnline && (
            <div className={styles.offline}>
              <IonIcon icon={cloudOfflineOutline} aria-hidden="true" />
              Sin conexión. Tu publicación se guardará como borrador.
            </div>
          )}

          {drafts.length > 0 && (
            <section className="enter-up">
              <h2 className={styles.label}>Borradores guardados</h2>
              <ul className={styles.drafts}>
                {drafts.map((d) => (
                  <li key={d.id}>
                    <IonIcon icon={documentTextOutline} aria-hidden="true" />
                    <div>
                      <strong>{CATEGORY_META[d.category].label}</strong>
                      <span>{d.text}</span>
                      <small>{timeAgo(d.createdAt)}</small>
                    </div>
                    <button type="button" onClick={() => publishDraft(d)} disabled={!isOnline || busy} className={styles.draftPublish}>
                      Publicar
                    </button>
                    <button type="button" onClick={() => d.id && deleteDraft(d.id)} aria-label="Eliminar borrador" className={styles.draftDelete}>
                      <IonIcon icon={trashOutline} />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {allowed.length > 1 && (
            <section className="enter-up">
              <h2 className={styles.label}>¿Qué quieres compartir?</h2>
              <div className={styles.categories} style={{ gridTemplateColumns: `repeat(${allowed.length > 3 ? 2 : allowed.length}, 1fr)` }} role="radiogroup" aria-label="Tipo de publicación">
                {allowed.map((c) => {
                  const meta = CATEGORY_META[c];
                  return (
                    <button
                      key={c}
                      type="button"
                      role="radio"
                      aria-checked={category === c}
                      className={`${styles.category} ${category === c ? styles.categoryActive : ''}`}
                      onClick={() => {
                        setCategory(c);
                        setError(null);
                      }}
                    >
                      <span className={`${styles.categoryIcon} ${styles[meta.tone]}`}>
                        <IonIcon icon={meta.icon} aria-hidden="true" />
                      </span>
                      <strong>{meta.label}</strong>
                      <small>{meta.hint}</small>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          <section className="enter-up" style={{ '--i': 1 } as CSSProperties}>
            <h2 className={styles.label}>Foto</h2>
            <PhotoPicker value={photo} onChange={setPhoto} hint="Una buena foto ayuda a que tu publicación llegue más lejos." />
          </section>

          {category === 'perdido' && (
            <section className="enter-up">
              <label className={styles.label} htmlFor="pet-name">
                Nombre de la mascota
              </label>
              <input id="pet-name" className={styles.input} value={petName} onChange={(e) => setPetName(e.target.value)} placeholder="Por ejemplo, Coco" maxLength={40} />
            </section>
          )}

          <section className="enter-up" style={{ '--i': 2 } as CSSProperties}>
            <label className={styles.label} htmlFor="post-text">
              {category === 'momento' ? 'Descripción (opcional)' : 'Descripción'}
            </label>
            <textarea
              id="post-text"
              className={styles.textarea}
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={MAX_TEXT}
              rows={4}
              placeholder={PLACEHOLDERS[category]}
            />
            <p className={styles.counter}>
              {text.length}/{MAX_TEXT}
            </p>
          </section>

          {category !== 'tip' && (
            <section className={`${styles.locationRow} enter-up`} style={{ '--i': 3 } as CSSProperties}>
              <IonIcon icon={locationOutline} aria-hidden="true" />
              <div>
                <small>Ubicación</small>
                <strong>{locating ? 'Buscando tu ubicación...' : location?.label ?? 'Sin ubicación'}</strong>
              </div>
              <button type="button" className={styles.relocate} onClick={locate} disabled={locating} aria-label="Actualizar ubicación">
                {locating ? <IonSpinner name="dots" /> : <IonIcon icon={refreshOutline} />}
              </button>
            </section>
          )}
        </div>
      </IonContent>

      <IonFooter className="ion-no-border">
        <div className={styles.footer}>
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
          <button type="button" className={styles.publish} onClick={publish} disabled={busy}>
            {busy ? (
              <span className={styles.busy}>
                <IonSpinner name="dots" />
                {status}
              </span>
            ) : isOnline ? (
              'Publicar'
            ) : (
              'Guardar borrador'
            )}
          </button>
        </div>
      </IonFooter>
    </IonPage>
  );
}
