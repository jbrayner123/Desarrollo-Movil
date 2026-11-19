import { memo } from 'react';
import type { Chat } from '../../types';
import { chatTime } from '../../helpers/format';
import { optimizedUrl } from '../../services/cloudinary';
import { ROLE_LABEL } from '../Feed/categories';
import Avatar from '../Shared/Avatar';
import styles from './Chat.module.scss';

interface ConversationItemProps {
  chat: Chat;
  myUid: string;
  onOpen: (chat: Chat) => void;
}

/** Fila de la lista de chats: avatar del otro miembro, ultimo mensaje, hora y no leidos. */
function ConversationItem({ chat, myUid, onOpen }: ConversationItemProps) {
  const otherId = chat.members.find((m) => m !== myUid) ?? '';
  const other = chat.memberInfo[otherId] ?? { name: 'Usuario', photo: '', role: 'owner' as const };
  const unread = chat.unread[myUid] ?? 0;
  const mine = chat.lastSenderId === myUid;

  return (
    <button type="button" className={styles.item} onClick={() => onOpen(chat)}>
      <Avatar src={optimizedUrl(other.photo, 120)} name={other.name} size={52} />
      <div className={styles.itemBody}>
        <p className={styles.itemTitle}>
          {other.name}
          {other.role !== 'owner' && <span className={styles.itemRole}>{ROLE_LABEL[other.role]}</span>}
        </p>
        <p className={`${styles.itemPreview} ${unread ? styles.itemUnread : ''}`}>
          {mine && 'Tú: '}
          {chat.lastMessage}
        </p>
      </div>
      <div className={styles.itemMeta}>
        <time dateTime={chat.updatedAt}>{chatTime(chat.updatedAt)}</time>
        {unread > 0 && <span className={styles.unread}>{unread}</span>}
      </div>
    </button>
  );
}

export default memo(ConversationItem);
