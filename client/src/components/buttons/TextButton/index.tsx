import { CSSProperties, MouseEventHandler } from 'react'

import styles from './index.module.css'

interface TextButtonProps {
  text: string
  onClick: MouseEventHandler
  style?: CSSProperties
}

export const TextButton = ({ text, onClick, style }: TextButtonProps) => {
  return (
    <button className={styles.button} style={style} type="button" onClick={onClick}>
      {text}
    </button>
  )
}
