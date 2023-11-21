import { MouseEventHandler } from 'react'

import type { SVGProps } from '@/typings/index'

import styles from './index.module.css'

interface ControlButtonProps {
  Icon: string | SVGProps
  enabled: boolean
  onClick: MouseEventHandler
}

export const ControlButton = ({ Icon, onClick, enabled }: ControlButtonProps) => {
  return (
    <div className={styles.container}>
      <button
        className={`${styles.button} ${enabled ? styles.active : styles.inactive}`}
        type="button"
        onClick={onClick}
      >
        <Icon fill="#fff" />
      </button>
    </div>
  )
}
