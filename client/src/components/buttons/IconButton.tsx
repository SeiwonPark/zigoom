import { MouseEventHandler } from 'react'

import { css } from '@emotion/react'

import type { SVGProps } from '@/typings/index'

interface IconButtonProps {
  Icon: string | SVGProps
  onClick: MouseEventHandler
  fill?: string
  hoverBackground?: string
}

export const IconButton = ({ Icon, onClick, fill, hoverBackground }: IconButtonProps) => {
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
            background-color: ${hoverBackground ? hoverBackground : '#f1f3f4'};
          }
        `}
        onClick={onClick}
      >
        <Icon fill={fill ? fill : '#5f6368'} width={24} height={24} />
      </button>
    </div>
  )
}
