import React, { useEffect, useRef, useState } from 'react'

import styles from './index.module.css'

interface DropdownProps {
  title: string
  children: React.ReactNode
}

export const Dropdown = ({ title, children }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleToggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  const handleOutsideClick = (event: any) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [])

  return (
    <div className={styles.container} ref={dropdownRef}>
      <input
        className={styles.dropdown}
        type="checkbox"
        id="dropdown"
        name="dropdown"
        checked={isOpen}
        onChange={handleToggleDropdown}
      />
      <label className={styles.title} htmlFor="dropdown">
        {title}
      </label>
      {isOpen && <div className={styles.dropdownList}>{children}</div>}
    </div>
  )
}

export default Dropdown
