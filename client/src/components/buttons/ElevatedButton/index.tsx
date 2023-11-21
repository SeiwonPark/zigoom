import { CSSProperties, MouseEventHandler } from 'react'

import type { SVGProps } from '@/typings/index'

import styles from './index.module.css'

interface ElevatedButtonProps {
  text: string
  onClick: MouseEventHandler
  Icon?: string | SVGProps // FIXME: why it doesn't work?
  style?: CSSProperties
}

export const ElevatedButton = ({ Icon, text, onClick, style }: ElevatedButtonProps) => {
  return (
    <button type="button" className={styles.button} style={style} onClick={onClick}>
      <div className={styles.buttonContainer}>
        {Icon && (
          <div className={styles.iconContainer}>
            <Icon fill="#fff" width={20} height={20} />
          </div>
        )}
        <span className={styles.buttonText}>{text}</span>
      </div>
    </button>
  )
}
