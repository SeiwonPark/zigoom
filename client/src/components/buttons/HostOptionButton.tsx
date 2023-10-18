import { MouseEventHandler } from 'react'

import { css } from '@emotion/react'

import type { SVGProps } from '@/typings/index'

interface HostOptionButtonProps {
  Icon: string | SVGProps
  fill?: string
  onClick?: MouseEventHandler
}

export const HostOptionButton = ({ Icon, fill, onClick }: HostOptionButtonProps) => {
  return (
    <div
      css={css`
        padding: 0.5rem;
      `}
    >
      <button
        type="button"
        css={css`
          border: none;
          width: 40px;
          height: 40px;
          align-items: center;
          justify-content: center;
          display: flex;
          border-radius: 100%;
          background-color: transparent;
          cursor: pointer;
          box-shadow: none;

          &:hover {
            background-color: rgba(232, 234, 237, 0.04);
          }
        `}
        onClick={onClick}
      >
        <Icon fill={fill ? fill : '#fff'} />
      </button>
    </div>
  )
}
