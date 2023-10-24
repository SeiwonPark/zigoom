import { CSSProperties, MouseEventHandler } from 'react'

import { css } from '@emotion/react'

interface TextButtonProps {
  text: string
  onClick: MouseEventHandler
  style?: CSSProperties
}

export const TextButton = ({ text, onClick, style }: TextButtonProps) => {
  return (
    <button
      css={css`
        padding: 1rem;
        border: none;
        border-radius: 6px;
        color: rgb(26, 115, 232);
        background-color: transparent;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;

        :hover {
          background-color: #f6fafe;
        }
      `}
      style={style}
      type="button"
      onClick={onClick}
    >
      {text}
    </button>
  )
}
