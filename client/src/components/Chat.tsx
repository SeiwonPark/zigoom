import { useContext, useEffect, useState } from 'react'
import { Message } from '../typings/types'
import { handleKeyUp } from '../utils/keys'
import { SocketContext } from '../contexts/SocketContext'

interface ChatProps {
  roomId?: string
  localPeerId: string
}

export const Chat = ({ roomId, localPeerId }: ChatProps) => {
  const socket = useContext(SocketContext)
  const [chatMessages, setChatMessages] = useState<Message[]>([])
  const [chatInput, setChatInput] = useState<string>('')

  useEffect(() => {
    socket.on('receive_chat', onReceiveChat)
  }, [])

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

  const onReceiveChat = (data: Message) => {
    setChatMessages((prev) => [...prev, data])
  }

  return (
    <>
      <div>
        {chatMessages.map((msg, idx) => (
          <div key={idx}>
            <strong>{msg.senderId}</strong>: {msg.message}
          </div>
        ))}
      </div>
      <div>
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyUp={(e) => handleKeyUp(e, sendChatMessage)}
        />
        <button type="button" onClick={() => sendChatMessage()}>
          Send
        </button>
      </div>
    </>
  )
}
