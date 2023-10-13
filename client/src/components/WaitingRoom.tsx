interface WaitingRoomProps {
  roomId: string
}

export const WaitingRoom = ({ roomId }: WaitingRoomProps) => {
  return <div>{roomId}</div>
}
