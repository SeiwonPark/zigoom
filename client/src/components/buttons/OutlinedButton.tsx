import type { SVGProps } from '../../typings/types'
import { css } from '@emotion/react'
import { MouseEventHandler } from 'react'

interface OutlinedButtonProps {
  Icon?: string | SVGProps // FIXME: why it doesn't work?
  text: string
  onClick: MouseEventHandler
}

export const OutlinedButton = ({ Icon, text, onClick }: OutlinedButtonProps) => {
  return (
    <button
      type="button"
      css={css`
        padding: 1rem;
        border: 1px solid #dadce0;
        border-radius: 4px;
        background-color: #f1f3f4;
        cursor: pointer;
        transition: box-shadow 0.16s;
        box-shadow: none;

        &:hover {
          background-color: #e8eaed;
        }
      `}
      onClick={onClick}
    >
      <div
        css={css`
          display: flex;
          align-items: center;
        `}
      >
        {Icon && (
          <div
            css={css`
              padding-right: 0.5rem;
              display: flex;
              align-items: center;
            `}
          >
            <Icon fill="#fff" width={20} height={20} />
          </div>
        )}
        <span
          css={css`
            font-size: 1rem;
            font-weight: 500;
            color: #000;
          `}
        >
          {text}
        </span>
      </div>
    </button>
  )
}
