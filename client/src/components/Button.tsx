import { css } from '@emotion/react'
import { MouseEventHandler } from 'react'

interface ButtonProps {
  text: string
  onClick: MouseEventHandler
}

export const Button = ({ text, onClick }: ButtonProps) => {
  return (
    <button
      type="button"
      css={css`
        padding: 1rem 1.5rem 1rem 1.5rem;
        border: none;
        border-radius: 6px;
        background-color: #1a73e8;
        cursor: pointer;
        transition: box-shadow 0.16s;
        box-shadow: none;

        &:hover {
          box-shadow: 0px 1px 3px rgba(33, 33, 33, 0.6), inset 0 0 300px rgba(33, 33, 33, 0.22);
        }
      `}
      onClick={onClick}
    >
      <span
        css={css`
          font-size: 0.875rem;
          color: #fff;
        `}
      >
        {text}
      </span>
    </button>
  )
}
