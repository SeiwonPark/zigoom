import { useCallback, useContext, useEffect, useState } from 'react'
import { css } from '@emotion/react'
import { Message } from '../typings/types'
import { handleKeyUp } from '../utils/keys'
import { SocketContext } from '../contexts/SocketContext'
import SendIcon from '../assets/icons/send.svg'
import { IconButton } from './buttons/IconButton'

interface ChatProps {
  roomId?: string
  localPeerId: string
}

export const Chat = ({ roomId, localPeerId }: ChatProps) => {
  const socket = useContext(SocketContext)
  const [chatMessages, setChatMessages] = useState<Message[]>([])
  const [chatInput, setChatInput] = useState<string>('')

  const onReceiveChat = useCallback((data: Message) => {
    setChatMessages((prev) => [...prev, data])
  }, [])

  useEffect(() => {
    socket.on('receive_chat', onReceiveChat)

    return () => {
      socket.off('receive_chat')
    }
  }, [onReceiveChat])

  const sendChatMessage = () => {
    socket.emit('send_chat', {
      roomId: roomId,
      senderId: localPeerId,
      message: chatInput,
    })

    const newChatMessage: Message = {
      senderId: localPeerId,
      message: chatInput,
    }

    setChatMessages((prev) => [...prev, newChatMessage])
    setChatInput('')
  }

  return (
    <div>
      <div>
        {chatMessages.map((msg, idx) => (
          <div key={idx}>
            <strong>{msg.senderId}</strong>: {msg.message}
          </div>
        ))}
      </div>
      <div
        css={css`
          padding: 0.5rem;
        `}
      >
        <div
          css={css`
            display: flex;
            width: 100%;
            border-radius: 20px;
            background-color: #f1f3f4;
          `}
        >
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyUp={(e) => handleKeyUp(e, sendChatMessage)}
            placeholder="Send a message to everyone"
            css={css`
              width: 100%;
              border: none;
              border-radius: 20px;
              background-color: inherit;
              padding-left: 1rem;

              &:active,
              &:focus {
                outline: none;
              }
            `}
          />
          <div
            css={css`
              maring-left: auto;
            `}
          >
            <IconButton Icon={SendIcon} fill="#aaa" onClick={() => sendChatMessage()} />
          </div>
        </div>
      </div>
    </div>
  )
}
