import React from 'react'

export const handleKeyUp = <T extends () => void>(event: React.KeyboardEvent<HTMLElement>, func: T) => {
  if (event.key === 'Enter') {
    event.preventDefault()
    func()
  }
}

export const handleEscape = <T extends () => void, E extends KeyboardEvent>(event: E, func: T) => {
  if (event.key === 'Escape' || event.key === 'Esc') {
    event.preventDefault()
    func()
  }
}
