import { MouseEventHandler } from 'react'

import type { SVGProps } from '@/typings/index'

import styles from './index.module.css'

interface OutlinedButtonProps {
  Icon?: string | SVGProps // FIXME: why it doesn't work?
  text: string
  onClick: MouseEventHandler
}

export const OutlinedButton = ({ Icon, text, onClick }: OutlinedButtonProps) => {
  return (
    <button type="button" className={styles.button} onClick={onClick}>
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
