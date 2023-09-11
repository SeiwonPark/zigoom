import { css } from '@emotion/react'
import { Chat } from './Chat'
import { IconButton } from './IconButton'
import CloseIcon from '../assets/icons/close.svg'

interface ChatBoxProps {
  isChatOpen: boolean
  roomId?: string
  localPeerId: string
  toggleChat: () => void
}

export const ChatBox = ({ isChatOpen, roomId, localPeerId, toggleChat }: ChatBoxProps) => {
  return (
    <div
      id="chat-container"
      css={css`
        height: calc(100% - 5rem);
        background-color: rgb(32, 33, 36);
        min-width: ${isChatOpen ? 'max(30%, 400px)' : '0px'};
        width: ${isChatOpen ? 'max(30%, 400px)' : '0px'};
        margin: ${isChatOpen ? '1rem' : '0px'};
        padding: 0;
        transition: width 0.28s;
        display: flex;
        align-items: center;
        justify-content: center;
      `}
    >
      <div
        css={css`
          height: calc(100% - 5rem);
          background-color: rgb(32, 33, 36);
          min-width: ${isChatOpen ? 'max(30%, 400px)' : '0px'};
          width: ${isChatOpen ? 'max(30%, 400px)' : '0px'};
          margin-right: 0rem;
          transition: width 0.28s;
          display: flex;
          align-items: center;
        `}
      >
        <div
          css={css`
            padding: 1rem;
            width: 100%;
            height: 90%;
            border-radius: 16px;
            background-color: #fff;
          `}
        >
          <div
            css={css`
              display: flex;
              align-items: center;
            `}
          >
            <span
              css={css`
                line-height: 1.5rem;
                font-size: 1.125rem;
                letter-spacing: 0;
                font-weight: 400;
                align-items: center;
                display: flex;
                flex-direction: row;
                height: 4rem;
                min-height: 4rem;
                padding-left: 1rem;
              `}
            >
              In-call messages
            </span>
            <div
              css={css`
                display: flex;
                align-items: center;
                margin-left: auto;
              `}
            >
              <IconButton Icon={CloseIcon} onClick={toggleChat} />
            </div>
          </div>
          <Chat roomId={roomId} localPeerId={localPeerId} />
        </div>
      </div>
    </div>
  )
}
