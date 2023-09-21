import { css, keyframes } from '@emotion/react'

interface SkeletonLoginButtonProps {
  width: number | string
}

export const SkeletonLoginButton = ({ width }: SkeletonLoginButtonProps) => {
  const loading = keyframes`
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  `

  return (
    <div
      css={css`
        padding: 2px 12px;
      `}
    >
      <div
        css={css`
          width: ${width};
          height: 40px;
          background: linear-gradient(90deg, #eee 25%, #ddd 50%, #eee 75%);
          background-size: 200% 100%;
          animation: ${loading} 2s infinite;
          border-radius: 4px;
        `}
      ></div>
    </div>
  )
}
