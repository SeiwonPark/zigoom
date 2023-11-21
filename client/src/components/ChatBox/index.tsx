import { CloseIcon } from '@/assets/icons'
import { IconButton } from '@/components/Buttons'
import { Chat } from '@/components/Chat'

import styles from './index.module.css'

interface ChatBoxProps {
  isChatOpen: boolean
  roomId?: string
  localPeerId: string
  toggleChat: () => void
}

export const ChatBox = ({ isChatOpen, roomId, localPeerId, toggleChat }: ChatBoxProps) => {
  return (
    <div className={`${styles.chatContainer} ${isChatOpen ? styles.active : styles.inactive}`} id="chat-container">
      <div className={`${styles.chatWrapper} ${isChatOpen ? styles.active : styles.inactive}`}>
        <div className={styles.chatboxWrapper}>
          <div className={styles.chatbox}>
            <span className={styles.chatTitle}>In-call messages</span>
            <div className={styles.iconContainer}>
              <IconButton Icon={CloseIcon} onClick={toggleChat} />
            </div>
          </div>
          <Chat roomId={roomId} localPeerId={localPeerId} />
        </div>
      </div>
    </div>
  )
}
