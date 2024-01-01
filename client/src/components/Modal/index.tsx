import { ReactNode, useEffect, useRef, useState } from 'react'

import { CloseIcon } from '@/assets/icons'
import { handleEscape } from '@/utils/keys'

import { IconButton } from '../Buttons'
import styles from './index.module.css'

interface ModalProps {
  children: ReactNode
  onClose: () => void
}

export const Modal = ({ children, onClose }: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const [_, setAnimate] = useState<boolean>(false)

  const handleClickOutside = (event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      onClose()
    }
  }

  useEffect(() => {
    const listener = (event: KeyboardEvent) => handleEscape(event, onClose)
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', listener)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', listener)
    }
  }, [])

  useEffect(() => {
    setAnimate(true)
  }, [])

  return (
    <div className={styles.container}>
      <div className={`${styles.modal}`} ref={modalRef}>
        <div className={styles.iconContainer}>
          <div className={styles.iconWrapper}>
            <IconButton Icon={CloseIcon} fill="#444746" hoverBackground="rgba(200, 200, 200, 0.4)" onClick={onClose} />
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}
