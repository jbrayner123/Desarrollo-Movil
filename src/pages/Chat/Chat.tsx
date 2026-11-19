import { useEffect, useRef, useState, type FormEvent } from 'react';
import { IonContent, IonFooter, IonIcon, IonPage, IonSpinner, useIonActionSheet } from '@ionic/react';
import { Geolocation } from '@capacitor/geolocation';
import { alertCircleOutline, chatbubblesOutline, locationOutline, send } from 'ionicons/icons';
import { useParams } from 'react-router-dom';
import DetailHeader from '../../components/Shared/DetailHeader';
import Avatar from '../../components/Shared/Avatar';
import EmptyState from '../../components/Shared/EmptyState';
import MessageBubble from '../../components/Chat/MessageBubble';
import LocationBubble from '../../components/Chat/LocationBubble';
import { useHaptics } from '../../hooks/useHaptics';
import { reverseGeocode, shortLabel } from '../../services/opencagedata';
import { ROLE_LABEL } from '../../components/Feed/categories';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useRealtime } from '../../hooks/useRealtime';
import { markChatRead, sendMessage, subscribeChat, subscribeMessages } from '../../services/chats.service';
import { optimizedUrl } from '../../services/cloudinary';
import type { Chat as ChatModel, Message } from '../../types';
import styles from './Chat.module.scss';

/** Conversacion en tiempo real entre dos cuentas (Firestore onSnapshot). */
export default function Chat() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { isOnline } = useApp();
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLIonContentElement>(null);
  const [sharing, setSharing] = useState(false);
  const [presentSheet] = useIonActionSheet();
  const haptics = useHaptics();

  const { data: chat, loading } = useRealtime<ChatModel | null>((onData, onError) => subscribeChat(id, onData, onError), [id], null);
  const { data: messages } = useRealtime<Message[]>((onData, onError) => subscribeMessages(id, onData, onError), [id], []);

  const uid = user?.uid ?? '';
  const otherId = chat?.members.find((m) => m !== uid) ?? '';
  const other = chat?.memberInfo[otherId];
  const unread = chat?.unread[uid] ?? 0;

  // Al abrir el chat (o recibir mensajes mientras esta abierto) se marcan como leidos.
  useEffect(() => {
    if (unread > 0 && uid) markChatRead(id, uid).catch(() => undefined);
  }, [unread, id, uid]);

  useEffect(() => {
    contentRef.current?.scrollToBottom(200);
  }, [messages.length]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const value = text.trim();
    if (!value || !isOnline || !otherId) return;
    setText('');
    setError(null);
    try {
      await sendMessage(id, uid, otherId, value);
    } catch {
      setText(value);
      setError('No se pudo enviar el mensaje.');
    }
  };

  /** Comparte la ubicacion actual: GPS -> direccion legible (OpenCage) -> mensaje. */
  const shareLocation = async () => {
    if (!otherId || !isOnline) return;
    setSharing(true);
    setError(null);
    try {
      try {
        const perm = await Geolocation.checkPermissions();
        if (perm.location !== 'granted') await Geolocation.requestPermissions();
      } catch {
        /* navegador: pregunta al leer la posicion */
      }
      const p = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 15_000 });
      const point = { lat: p.coords.latitude, lng: p.coords.longitude };
      let label = 'Mi ubicación';
      try {
        const address = await reverseGeocode(point);
        if (address) label = `${address.street}, ${shortLabel(address)}`;
      } catch {
        /* sin direccion legible: se envian solo las coordenadas */
      }
      await sendMessage(id, uid, otherId, label, { ...point, label });
      haptics.success();
    } catch {
      setError('No se pudo obtener tu ubicación. Activa el GPS e intenta de nuevo.');
    } finally {
      setSharing(false);
    }
  };

  const confirmShare = () =>
    presentSheet({
      header: `Compartir tu ubicación con ${other?.name ?? 'esta persona'}`,
      subHeader: 'Se enviará tu ubicación actual una sola vez.',
      buttons: [
        { text: 'Enviar mi ubicación actual', handler: () => void shareLocation() },
        { text: 'Cancelar', role: 'cancel' }
      ]
    });

  return (
    <IonPage>
      <DetailHeader
        fallback="/app/perfil"
        title={
          other && (
            <span className={styles.peer}>
              <Avatar src={optimizedUrl(other.photo, 100)} name={other.name} size={36} />
              <span className={styles.peerText}>
                <strong>{other.name}</strong>
                <small>{ROLE_LABEL[other.role]}</small>
              </span>
            </span>
          )
        }
      />

      <IonContent ref={contentRef}>
        {loading ? (
          <div className={styles.loading}>
            <IonSpinner name="dots" />
          </div>
        ) : !chat ? (
          <EmptyState icon={alertCircleOutline} title="Conversación no encontrada" text="Vuelve a tus mensajes e intenta de nuevo." />
        ) : messages.length === 0 ? (
          <EmptyState icon={chatbubblesOutline} title="Empieza la conversación" text={`Escríbele a ${other?.name ?? 'esta persona'}. Te responderá por aquí.`} />
        ) : (
          <div className={styles.thread}>
            {messages.map((m) =>
              m.kind === 'location' ? (
                <LocationBubble key={m.id} message={m} mine={m.senderId === uid} />
              ) : (
                <MessageBubble key={m.id} message={m} mine={m.senderId === uid} />
              )
            )}
          </div>
        )}
      </IonContent>

      {chat && (
        <IonFooter className="ion-no-border">
          {error && <p className={styles.error}>{error}</p>}
          <form className={styles.composer} onSubmit={submit}>
            <button
              type="button"
              className={styles.shareButton}
              onClick={confirmShare}
              disabled={!isOnline || sharing}
              aria-label="Compartir mi ubicación"
            >
              {sharing ? <IonSpinner name="dots" /> : <IonIcon icon={locationOutline} />}
            </button>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={isOnline ? 'Escribe un mensaje' : 'Sin conexión'}
              disabled={!isOnline}
              maxLength={1000}
              aria-label="Escribe un mensaje"
            />
            <button type="submit" disabled={!text.trim() || !isOnline} aria-label="Enviar mensaje">
              <IonIcon icon={send} />
            </button>
          </form>
        </IonFooter>
      )}
    </IonPage>
  );
}
