import { CloseIcon } from '@/assets/icons'
import { IconButton } from '@/components/Buttons'
import { Chat } from '@/components/Chat'
import { useLocalOption } from '@/hooks/useStore'

import styles from './index.module.css'

interface ChatBoxProps {
  roomId?: string
  localPeerId: string
}

export const ChatBox = ({ roomId, localPeerId }: ChatBoxProps) => {
  const { isChatOpen, setIsChatOpen } = useLocalOption()

  return (
    <div className={`${styles.chatContainer} ${isChatOpen ? styles.active : styles.inactive}`} id="chat-container">
      <div className={styles.chatboxWrapper}>
        <div className={styles.chatbox}>
          <span className={styles.chatTitle}>In-call messages</span>
          <div className={styles.iconContainer}>
            <IconButton Icon={CloseIcon} onClick={() => setIsChatOpen(false)} />
          </div>
        </div>
        <Chat roomId={roomId} localPeerId={localPeerId} />
      </div>
    </div>
  )
}
