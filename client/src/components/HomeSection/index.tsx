import { VideoAddIcon } from '@/assets/icons'
import { ElevatedButton, TextButton } from '@/components/Buttons'

import styles from './index.module.css'

interface HomeSectionProps {
  onSessionStart: () => void
  onSessionIdChange: (sessionId: string) => void
  onSessionEnter: () => void
  inputSessionId: string
}

export const HomeSection = ({
  onSessionStart,
  onSessionIdChange,
  onSessionEnter,
  inputSessionId,
}: HomeSectionProps) => {
  return (
    <section className={styles.section}>
      <h1 className={styles.title}>Video calls and meetings for everyone.</h1>
      <div className={styles.actionContainer}>
        <ElevatedButton
          Icon={VideoAddIcon}
          text="Start a meeting"
          onClick={onSessionStart}
          style={{ width: 'fit-content', minWidth: 'fit-content' }}
        />
        <div className={styles.wrapper}>
          <input
            className={styles.roomInput}
            type="text"
            placeholder="Enter a code or link"
            value={inputSessionId}
            onChange={(e) => onSessionIdChange(e.target.value)}
          />
          <TextButton
            text="Enter"
            onClick={onSessionEnter}
            style={{
              color: inputSessionId.trim() === '' ? '#B5B6B7' : 'rgb(26, 115, 232)',
              pointerEvents: inputSessionId.trim() === '' ? 'none' : 'auto',
            }}
          />
        </div>
      </div>
    </section>
  )
}
