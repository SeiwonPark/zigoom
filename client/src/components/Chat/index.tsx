import { useCallback, useContext, useEffect, useRef, useState } from 'react'

import { SendIcon } from '@/assets/icons'
import { IconButton } from '@/components/Buttons'
import { SocketContext } from '@/contexts/SocketContext'
import { handleKeyUp } from '@/utils/keys'
import { ReceiveChatSchema, isReceiveChatSchema } from '@/validations/socket.validation'

import styles from './index.module.css'

interface ChatProps {
  roomId?: string
  localPeerId: string
}

export const Chat = ({ roomId, localPeerId }: ChatProps) => {
  const socket = useContext(SocketContext)
  const [chatMessages, setChatMessages] = useState<ReceiveChatSchema[]>([])
  const [chatInput, setChatInput] = useState<string>('')
  const chatRef = useRef<any>(null)

  const onReceiveChat = useCallback((data: any) => {
    if (!isReceiveChatSchema(data)) {
      throw new Error('Invalid payload type for ReceiveChatSchema.')
    }

    setChatMessages((prev) => [...prev, data])
  }, [])

  useEffect(() => {
    socket.on('receive_chat', onReceiveChat)

    return () => {
      socket.off('receive_chat')
    }
  }, [onReceiveChat])

  const scrollToBottom = () => {
    chatRef.current?.scrollIntoView()
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages])

  const sendChatMessage = () => {
    if (chatInput.trim() === '') {
      return
    }

    socket.emit('send_chat', {
      roomId: roomId,
      senderId: localPeerId,
      message: chatInput,
    })

    const newChatMessage: ReceiveChatSchema = {
      senderId: localPeerId,
      message: chatInput,
    }

    setChatMessages((prev) => [...prev, newChatMessage])
    setChatInput('')
  }

  return (
    <div className={styles.container}>
      <div className={styles.messages}>
        {chatMessages.map((msg, idx) => (
          <div key={idx}>
            <strong>{msg.senderId}</strong>: {msg.message}
          </div>
        ))}
        <div ref={chatRef} />
      </div>
      <div className={styles.wrapper}>
        <div className={styles.chatBox}>
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyUp={(e) => handleKeyUp(e, sendChatMessage)}
            placeholder="Send a message to everyone"
            className={styles.chatInput}
          />
          <div className={styles.iconContainer}>
            <IconButton Icon={SendIcon} fill="#aaa" onClick={() => sendChatMessage()} />
          </div>
        </div>
      </div>
    </div>
  )
}
