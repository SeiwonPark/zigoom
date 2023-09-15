import { MouseEventHandler } from 'react'
import { css } from '@emotion/react'
import { SVGProps } from '../typings/types'

interface IconProps {
  Icon: string | SVGProps
  fill?: string
  width?: number | string
  height?: number | string
  onClick?: MouseEventHandler
}

export const SVGIcon = ({ Icon, fill, width, height, onClick }: IconProps) => {
  return (
    <Icon
      fill={fill ? fill : '#f0f0f0'}
      width={width ? width : 24}
      height={height ? height : 24}
      onClick={onClick}
      css={css`
        cursor: pointer;
      `}
    />
  )
}
