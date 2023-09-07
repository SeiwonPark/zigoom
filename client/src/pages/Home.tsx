import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { handleKeyUp } from '../utils/keys'
import { SocketContext } from '../contexts/SocketContext'

export default function Home() {
  const [roomId, setRoomId] = useState<string>('')
  const socket = useContext(SocketContext)
  const naviagte = useNavigate()

  const enterRoom = () => {
    if (socket) {
      naviagte(`/room/${roomId}`)
    }
  }

  return (
    <div>
      <input
        type="text"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        placeholder="Enter Room ID"
        onKeyUp={(e) => handleKeyUp(e, enterRoom)}
      />
      <button type="button" onClick={enterRoom}>
        Enter Room
      </button>
    </div>
  )
}
