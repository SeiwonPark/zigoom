import { MouseEventHandler } from 'react'

import { SVGProps } from '@/typings/types'

import styles from './index.module.css'

interface IconButtonProps {
  Icon: string | SVGProps
  onClick: MouseEventHandler
  fill?: string
  hoverBackground?: string
}

export const IconButton = ({ Icon, onClick, fill, hoverBackground }: IconButtonProps) => {
  return (
    <div className={styles.container}>
      <button
        type="button"
        className={styles.button}
        onClick={onClick}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = hoverBackground || '#f1f3f4')}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        <Icon fill={fill || '#5f6368'} width={24} height={24} />
      </button>
    </div>
  )
}
