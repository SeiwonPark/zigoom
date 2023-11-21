import { MouseEventHandler } from 'react'

import type { SVGProps } from '@/typings/index'

import styles from './index.module.css'

interface HostOptionButtonProps {
  Icon: string | SVGProps
  fill?: string
  onClick?: MouseEventHandler
}

export const HostOptionButton = ({ Icon, fill, onClick }: HostOptionButtonProps) => {
  return (
    <div className={styles.container}>
      <button type="button" className={styles.button} onClick={onClick}>
        <Icon fill={fill ? fill : '#fff'} />
      </button>
    </div>
  )
}
