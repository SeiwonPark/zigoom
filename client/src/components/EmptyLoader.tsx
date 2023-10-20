/**
 * Copyright (c) 2023 by Travis Horn (https://codepen.io/travishorn/pen/YyGVRG)
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * Referred original code by Travis Horn (https://codepen.io/travishorn/pen/YyGVRG) and modified with minor
 * style changes.
 */
import { css, keyframes } from '@emotion/react'

export const EmptyLoader = () => {
  const bounce = keyframes`
    50% {
      transform: translateY(25px);
    }
  `

  const dot = css`
    width: 22px;
    height: 22px;
    border-radius: 11px;
    margin: 0 10px;
    animation: 1s ${bounce} ease infinite;
  `

  return (
    <div
      css={css`
        width: 100vw;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
      `}
    >
      <div
        css={[
          dot,
          css`
            background-color: #4285f5;
          `,
        ]}
      ></div>
      <div
        css={[
          dot,
          css`
            background-color: #ea4436;
            animation-delay: 0.25s;
          `,
        ]}
      ></div>
      <div
        css={[
          dot,
          css`
            background-color: #fbbd06;
            animation-delay: 0.5s;
          `,
        ]}
      ></div>
      <div
        css={[
          dot,
          css`
            background-color: #34a952;
            animation-delay: 0.75s;
          `,
        ]}
      ></div>
    </div>
  )
}
