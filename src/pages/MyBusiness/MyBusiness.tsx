import { useEffect, useState } from 'react';
import { useRef } from 'react';
import { IonContent, IonIcon, IonPage, IonSpinner, useIonRouter, useIonToast } from '@ionic/react';
import { chatbubblesOutline, createOutline, eyeOutline, shieldCheckmarkOutline, star, timeOutline } from 'ionicons/icons';
import PageHeader from '../../components/Shared/PageHeader';
import CompactHeader from '../../components/Shared/CompactHeader';
import { useScrollHeader } from '../../hooks/useScrollHeader';
import BusinessForm, { validateBusiness, type BusinessFormErrors, type BusinessFormValue } from '../../components/Vets/BusinessForm';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useHaptics } from '../../hooks/useHaptics';
import { averageRating, recommendation, updateBusiness } from '../../services/businesses.service';
import { updateMyProfile } from '../../services/auth.service';
import { resolveImage } from '../../services/cloudinary';
import { toUserMessage } from '../../helpers/httpErrors';
import type { Business } from '../../types';
import styles from './MyBusiness.module.scss';

const toForm = (b: Business): BusinessFormValue => ({
  name: b.name,
  tagline: b.tagline,
  phone: b.phone,
  schedule: b.schedule,
  services: b.services,
  directions: b.directions,
  place: { address: b.address, neighborhood: b.neighborhood, location: b.location },
  logo: b.logoUrl || null
});

/** Panel de la veterinaria o el petshop: resumen, estado de verificacion y edicion del perfil. */
export default function MyBusiness() {
  // Encabezado que se oculta al bajar y reaparece al subir.
  const scroll = useScrollHeader();
  const contentRef = useRef<HTMLIonContentElement>(null);
  const router = useIonRouter();
  const [presentToast] = useIonToast();
  const haptics = useHaptics();
  const { user, business } = useAuth();
  const { chats, posts, isOnline } = useApp();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<BusinessFormValue | null>(null);
  const [errors, setErrors] = useState<BusinessFormErrors>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (business && !editing) setForm(toForm(business));
  }, [business, editing]);

  if (!business || !form) {
    return (
      <IonPage>
        <IonContent>
          <div className={styles.loading}>
            <IonSpinner name="dots" />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const rec = recommendation(business);
  const avg = averageRating(business);
  const myPosts = posts.filter((p) => p.authorId === user?.uid).length;

  const save = async () => {
    const found = validateBusiness(form);
    setErrors(found);
    if (Object.keys(found).length || !user) return;
    setSaving(true);
    try {
      const logoUrl = await resolveImage(form.logo, 'negocios');
      await updateBusiness(user.uid, {
        name: form.name.trim(),
        tagline: form.tagline.trim(),
        phone: form.phone.trim(),
        schedule: form.schedule.trim(),
        services: form.services,
        address: form.place!.address.trim(),
        neighborhood: form.place!.neighborhood.trim(),
        directions: form.directions.trim(),
        location: form.place!.location,
        logoUrl
      });
      if (logoUrl !== user.photoUrl) await updateMyProfile(user.uid, { photoUrl: logoUrl });
      haptics.success();
      setEditing(false);
      presentToast({ message: 'Perfil del negocio actualizado.', duration: 1600, position: 'top' });
    } catch (e) {
      presentToast({ message: toUserMessage(e), duration: 2200, position: 'top' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <IonPage>
      <CompactHeader title="Mi negocio" visible={scroll.compactVisible} contentRef={contentRef} />
      <IonContent fullscreen ref={contentRef} {...scroll.contentProps}>
        <div className="page-pad">
          <PageHeader eyebrow={business.type === 'vet' ? 'Veterinaria' : 'Petshop'} title="Mi negocio." />

          <section className={`${styles.status} ${business.verified ? styles.verified : styles.pending} enter-up`}>
            <IonIcon icon={business.verified ? shieldCheckmarkOutline : timeOutline} aria-hidden="true" />
            <div>
              <strong>{business.verified ? 'Negocio verificado' : 'Pendiente de verificación'}</strong>
              <p>
                {business.verified
                  ? 'Tu perfil muestra la insignia de verificado en el directorio.'
                  : 'Ya apareces en el directorio. Un administrador revisará tus datos para darte la insignia.'}
              </p>
            </div>
          </section>

          <section className={styles.stats}>
            <div className="enter-up">
              <strong>{rec !== null ? `${rec}%` : '--'}</strong>
              <span>Recomendación</span>
            </div>
            <div className="enter-up">
              <strong className={styles.rating}>
                <IonIcon icon={star} aria-hidden="true" />
                {avg !== null ? avg.toLocaleString('es-CO') : '--'}
              </strong>
              <span>{business.ratingCount} {business.ratingCount === 1 ? 'reseña' : 'reseñas'}</span>
            </div>
            <div className="enter-up">
              <strong>{chats.length}</strong>
              <span>Conversaciones</span>
            </div>
            <div className="enter-up">
              <strong>{myPosts}</strong>
              <span>Publicaciones</span>
            </div>
          </section>

          <div className={styles.actions}>
            <button type="button" className={styles.secondary} onClick={() => router.push(`/app/negocio/${business.id}`, 'forward')}>
              <IonIcon icon={eyeOutline} aria-hidden="true" />
              Ver como cliente
            </button>
            <button type="button" className={styles.secondary} onClick={() => router.push('/app/perfil', 'none', 'replace')}>
              <IonIcon icon={chatbubblesOutline} aria-hidden="true" />
              Mensajes
            </button>
          </div>

          <div className={styles.editHead}>
            <h2>Datos del negocio</h2>
            {!editing && (
              <button type="button" className={styles.editButton} onClick={() => setEditing(true)}>
                <IonIcon icon={createOutline} aria-hidden="true" />
                Editar
              </button>
            )}
          </div>

          {editing ? (
            <div className={styles.editor}>
              <BusinessForm type={business.type} value={form} errors={errors} onChange={setForm} />
              <div className={styles.editorActions}>
                <button type="button" className={styles.secondary} onClick={() => { setEditing(false); setErrors({}); }} disabled={saving}>
                  Cancelar
                </button>
                <button type="button" className={styles.primary} onClick={save} disabled={saving || !isOnline}>
                  {saving ? <IonSpinner name="dots" /> : 'Guardar cambios'}
                </button>
              </div>
            </div>
          ) : (
            <dl className={styles.summary}>
              <div>
                <dt>Dirección</dt>
                <dd>
                  {business.address}
                  {business.neighborhood && `, ${business.neighborhood}`}
                </dd>
              </div>
              {business.directions && (
                <div>
                  <dt>Indicaciones</dt>
                  <dd>{business.directions}</dd>
                </div>
              )}
              <div>
                <dt>Teléfono</dt>
                <dd>{business.phone || 'Sin registrar'}</dd>
              </div>
              <div>
                <dt>Horario</dt>
                <dd>{business.schedule || 'Sin registrar'}</dd>
              </div>
              <div>
                <dt>Servicios</dt>
                <dd>{business.services.join(', ')}</dd>
              </div>
            </dl>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
}
