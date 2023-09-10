import { css } from '@emotion/react'
import { SVGProps } from '../typings/types'
import { MouseEventHandler } from 'react'

interface ControlButtonProps {
  Icon: string | SVGProps
  onClick: MouseEventHandler
  enabled: boolean
}

export const ControlButton = ({ Icon, onClick, enabled }: ControlButtonProps) => {
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
          background-color: ${enabled ? 'rgb(60, 64, 67)' : 'rgb(234, 67, 53)'};
          cursor: pointer;
          box-shadow: none;

          &:hover {
            background-color: ${enabled ? 'rgb(77, 80, 81)' : 'rgb(245, 77, 63)'};
          }
        `}
        onClick={onClick}
      >
        <Icon fill="#fff" width={20} height={20} />
      </button>
    </div>
  )
}
