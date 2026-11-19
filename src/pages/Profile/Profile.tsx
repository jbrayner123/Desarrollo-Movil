import { useState, type CSSProperties } from 'react';
import { useRef } from 'react';
import {
  IonContent,
  IonIcon,
  IonModal,
  IonPage,
  IonSpinner,
  IonToggle,
  useIonActionSheet,
  useIonAlert,
  useIonRouter,
  useIonToast
} from '@ionic/react';
import {
  arrowForward,
  briefcaseOutline,
  chatbubblesOutline,
  chevronForward,
  createOutline,
  logOutOutline,
  pawOutline,
  shieldCheckmarkOutline
} from 'ionicons/icons';
import PageHeader from '../../components/Shared/PageHeader';
import CompactHeader from '../../components/Shared/CompactHeader';
import { useScrollHeader } from '../../hooks/useScrollHeader';
import FilterChips, { type ChipOption } from '../../components/Shared/FilterChips';
import EmptyState from '../../components/Shared/EmptyState';
import Avatar from '../../components/Shared/Avatar';
import ConversationItem from '../../components/Chat/ConversationItem';
import PetProfileCard from '../../components/Profile/PetProfileCard';
import { ROLE_LABEL } from '../../components/Feed/categories';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useCamera } from '../../hooks/useCamera';
import { useHaptics } from '../../hooks/useHaptics';
import { updatePet } from '../../services/pets.service';
import { updateMyProfile } from '../../services/auth.service';
import { optimizedUrl, uploadImage } from '../../services/cloudinary';
import { toUserMessage } from '../../helpers/httpErrors';
import type { Chat } from '../../types';
import styles from './Profile.module.scss';

type Tab = 'mensajes' | 'cuenta';

/** Mensajes y perfil ("Siempre conectados."): chats en vivo y datos de la cuenta. */
export default function Profile() {
  // Encabezado que se oculta al bajar y reaparece al subir.
  const scroll = useScrollHeader();
  const contentRef = useRef<HTMLIonContentElement>(null);
  const router = useIonRouter();
  const { chats, isOnline } = useApp();
  const { user, pet, business, isAdmin, isBusiness, logout } = useAuth();
  const { takePhoto } = useCamera();
  const haptics = useHaptics();
  const [presentAlert] = useIonAlert();
  const [presentToast] = useIonToast();
  const [presentSheet] = useIonActionSheet();

  const [tab, setTab] = useState<Tab>('mensajes');
  const [uploading, setUploading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', breed: '', age: '', weight: '', bio: '', vaccines: false });

  const tabs: ChipOption<Tab>[] = [
    { value: 'mensajes', label: 'Mensajes' },
    { value: 'cuenta', label: isBusiness ? 'Mi cuenta' : 'Mi mascota' }
  ];

  const toast = (message: string) => presentToast({ message, duration: 1800, position: 'top' });
  const openChat = (c: Chat) => router.push(`/app/chat/${c.id}`, 'forward');

  /** Cambia la foto de la mascota: camara o galeria -> Cloudinary -> Firestore. */
  const changePhoto = () =>
    presentSheet({
      header: 'Foto de tu mascota',
      buttons: [
        { text: 'Tomar foto', handler: () => uploadPetPhoto('camera') },
        { text: 'Elegir de la galería', handler: () => uploadPetPhoto('gallery') },
        { text: 'Cancelar', role: 'cancel' }
      ]
    });

  const uploadPetPhoto = async (source: 'camera' | 'gallery') => {
    if (!pet || !user) return;
    if (!isOnline) return toast('Necesitas conexión para cambiar la foto.');
    try {
      const photo = await takePhoto(source);
      if (!photo) return;
      setUploading(true);
      const url = await uploadImage(photo, 'mascotas');
      await updatePet(pet.id, { photoUrl: url });
      await updateMyProfile(user.uid, { photoUrl: url });
      haptics.success();
      toast('Foto actualizada.');
    } catch (e) {
      toast(toUserMessage(e));
    } finally {
      setUploading(false);
    }
  };

  const openEdit = () => {
    setForm({
      name: user?.displayName ?? '',
      breed: pet?.breed ?? '',
      age: pet ? String(pet.ageYears) : '',
      weight: pet ? String(pet.weightKg) : '',
      bio: pet?.bio ?? '',
      vaccines: pet?.vaccinesUpToDate ?? false
    });
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!user || form.name.trim().length < 2) return toast('Escribe tu nombre.');
    setSaving(true);
    try {
      await updateMyProfile(user.uid, { displayName: form.name.trim() });
      if (pet) {
        await updatePet(pet.id, {
          breed: form.breed.trim(),
          ageYears: Number(form.age) || 0,
          weightKg: Number(form.weight) || 0,
          bio: form.bio.trim(),
          vaccinesUpToDate: form.vaccines
        });
      }
      haptics.success();
      setEditOpen(false);
      toast('Perfil actualizado.');
    } catch (e) {
      toast(toUserMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const confirmLogout = () =>
    presentAlert({
      header: 'Cerrar sesión',
      message: '¿Seguro que quieres salir de tu cuenta?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Cerrar sesión',
          role: 'destructive',
          handler: async () => {
            await logout();
            router.push('/login', 'root', 'replace');
          }
        }
      ]
    });

  return (
    <IonPage>
      <CompactHeader
        title="Siempre conectados"
        visible={scroll.compactVisible}
        contentRef={contentRef}
        action={
          <button type="button" className={styles.logoutPill} onClick={confirmLogout} aria-label="Cerrar sesión">
            <IonIcon icon={logOutOutline} aria-hidden="true" />
            Salir
          </button>
        }
      />
      <IonContent fullscreen ref={contentRef} {...scroll.contentProps}>
        <div className="page-pad">
          <PageHeader
            eyebrow="Comunidad"
            title="Siempre conectados."
            action={
              <button type="button" className={styles.logoutPill} onClick={confirmLogout} aria-label="Cerrar sesión">
                <IonIcon icon={logOutOutline} aria-hidden="true" />
                Salir
              </button>
            }
          />

          <FilterChips options={tabs} value={tab} onChange={setTab} ariaLabel="Secciones del perfil" />

          {tab === 'mensajes' ? (
            <section key="mensajes" className={styles.panel}>
              <p className={styles.intro}>Una conversación puede ser el inicio de una amistad.</p>

              {chats.length === 0 ? (
                <EmptyState
                  icon={chatbubblesOutline}
                  title="Sin conversaciones"
                  text={isBusiness ? 'Cuando un cliente te escriba, la conversación aparecerá aquí.' : 'Escríbele a alguien desde una publicación o a un negocio desde Servicios.'}
                />
              ) : (
                chats.map((c, i) => (
                  <div key={c.id} className="enter-up" style={{ '--i': Math.min(i, 6) } as CSSProperties}>
                    <ConversationItem chat={c} myUid={user?.uid ?? ''} onOpen={openChat} />
                  </div>
                ))
              )}

              {!isBusiness && (
                <section className={styles.community}>
                  <IonIcon icon={pawOutline} className={styles.communityIcon} aria-hidden="true" />
                  <h2>Los mejores amigos están cerca.</h2>
                  <p>Comparte un paseo con tu comunidad.</p>
                  <button type="button" className={styles.darkPill} onClick={() => router.push('/app/mapa', 'none', 'replace')}>
                    Encontrar mi manada
                    <IonIcon icon={arrowForward} aria-hidden="true" />
                  </button>
                </section>
              )}
            </section>
          ) : (
            <section key="cuenta" className={styles.panel}>
              {!isBusiness &&
                (pet ? (
                  <div className="enter-up">
                    <PetProfileCard pet={pet} onChangePhoto={changePhoto} uploading={uploading} />
                  </div>
                ) : (
                  <EmptyState icon={pawOutline} title="Sin mascota registrada" text="Tu cuenta no tiene una mascota asociada." />
                ))}

              <div className={`${styles.owner} enter-up`} style={{ '--i': 1 } as CSSProperties}>
                <Avatar src={optimizedUrl(isBusiness ? business?.logoUrl : user?.photoUrl, 120)} name={user?.displayName ?? 'Usuario'} size={56} />
                <div>
                  <h3>{user?.displayName}</h3>
                  <p>{user?.email}</p>
                  <p>
                    {user ? ROLE_LABEL[user.role] : ''} · {user?.city}
                  </p>
                </div>
              </div>

              <ul className={`${styles.menu} enter-up`} style={{ '--i': 2 } as CSSProperties}>
                {isBusiness ? (
                  <li>
                    <button type="button" onClick={() => router.push('/app/mi-negocio', 'none', 'replace')}>
                      <IonIcon icon={briefcaseOutline} aria-hidden="true" />
                      Administrar mi negocio
                      <IonIcon icon={chevronForward} className={styles.chevron} aria-hidden="true" />
                    </button>
                  </li>
                ) : (
                  <li>
                    <button type="button" onClick={openEdit}>
                      <IonIcon icon={createOutline} aria-hidden="true" />
                      Editar perfil y mascota
                      <IonIcon icon={chevronForward} className={styles.chevron} aria-hidden="true" />
                    </button>
                  </li>
                )}
                {isAdmin && (
                  <li>
                    <button type="button" onClick={() => router.push('/admin', 'forward')}>
                      <IonIcon icon={shieldCheckmarkOutline} aria-hidden="true" />
                      Panel de administración
                      <IonIcon icon={chevronForward} className={styles.chevron} aria-hidden="true" />
                    </button>
                  </li>
                )}
                <li>
                  <button type="button" className={styles.danger} onClick={confirmLogout}>
                    <IonIcon icon={logOutOutline} aria-hidden="true" />
                    Cerrar sesión
                  </button>
                </li>
              </ul>
            </section>
          )}
        </div>

        <IonModal isOpen={editOpen} onDidDismiss={() => setEditOpen(false)} className="sheet-modal" initialBreakpoint={0.9} breakpoints={[0, 0.9]} handle>
          <div className={styles.editSheet}>
            <h2>Editar perfil</h2>
            <label>
              Tu nombre
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={60} />
            </label>
            {pet && (
              <>
                <label>
                  Raza de {pet.name}
                  <input value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} maxLength={40} />
                </label>
                <div className={styles.editRow}>
                  <label>
                    Edad (años)
                    <input inputMode="numeric" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value.replace(/[^\d]/g, '') })} />
                  </label>
                  <label>
                    Peso (kg)
                    <input inputMode="decimal" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value.replace(/[^\d.]/g, '') })} />
                  </label>
                </div>
                <label>
                  Sobre {pet.name}
                  <textarea rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} maxLength={200} />
                </label>
                <div className={styles.toggleRow}>
                  <span>Vacunas al día</span>
                  <IonToggle checked={form.vaccines} onIonChange={(e) => setForm({ ...form, vaccines: e.detail.checked })} aria-label="Vacunas al día" />
                </div>
              </>
            )}
            <button type="button" className={styles.saveButton} onClick={saveEdit} disabled={saving || !isOnline}>
              {saving ? <IonSpinner name="dots" /> : 'Guardar cambios'}
            </button>
          </div>
        </IonModal>
      </IonContent>
    </IonPage>
  );
}
