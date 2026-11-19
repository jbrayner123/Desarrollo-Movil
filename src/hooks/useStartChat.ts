import { useCallback, useState } from 'react';
import { useIonRouter, useIonToast } from '@ionic/react';
import { useAuth } from '../context/AuthContext';
import { ensureChat } from '../services/chats.service';
import type { ChatMember } from '../types';

/** Abre (o crea) el chat con otra cuenta y navega a la conversacion. */
export function useStartChat() {
  const router = useIonRouter();
  const { user, identity } = useAuth();
  const [presentToast] = useIonToast();
  const [opening, setOpening] = useState(false);

  const startChat = useCallback(
    async (other: { uid: string } & ChatMember) => {
      if (!user || !identity || other.uid === user.uid) return;
      setOpening(true);
      try {
        const id = await ensureChat({ uid: user.uid, ...identity }, other);
        router.push(`/app/chat/${id}`, 'forward');
      } catch {
        presentToast({ message: 'No se pudo abrir la conversación.', duration: 2000, position: 'top' });
      } finally {
        setOpening(false);
      }
    },
    [user, identity, router, presentToast]
  );

  return { startChat, opening };
}
