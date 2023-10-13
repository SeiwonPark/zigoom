import { MouseEventHandler } from 'react'

import { css } from '@emotion/react'

import type { SVGProps } from '@/typings/index'

interface ElevatedButtonProps {
  Icon?: string | SVGProps // FIXME: why it doesn't work?
  text: string
  onClick: MouseEventHandler
}

export const ElevatedButton = ({ Icon, text, onClick }: ElevatedButtonProps) => {
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
          box-shadow: 0px 1px 3px rgba(33, 33, 33, 0.6), inset 0 0 300px rgba(33, 33, 33, 0.1);
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
            color: #fff;
          `}
        >
          {text}
        </span>
      </div>
    </button>
  )
}
