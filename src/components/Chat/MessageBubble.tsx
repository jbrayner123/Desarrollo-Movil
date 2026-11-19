import { memo } from 'react';
import type { Message } from '../../types';
import { messageTime } from '../../helpers/format';
import styles from './Chat.module.scss';

/** Burbuja de mensaje: oscura si es propio, blanca si es recibido. */
function MessageBubble({ message, mine }: { message: Message; mine: boolean }) {
  return (
    <div className={`${styles.bubbleRow} ${mine ? styles.mine : styles.theirs}`}>
      <div className={`${styles.bubble} ${message.pending ? styles.pending : ''}`}>
        <p>{message.text}</p>
        <time dateTime={message.createdAt}>{message.pending ? 'Enviando' : messageTime(message.createdAt)}</time>
      </div>
    </div>
  );
}

export default memo(MessageBubble);
