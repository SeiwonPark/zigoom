import { useState } from 'react'

import { LocalVideo, RemoteVideo } from '@/components/Videos'
import { ChatBox, ControlBar } from '@/components/index'
import { VIDEO_GRIDS } from '@/configs/webrtc'
import { useLocalOption, useScreen, useWebRTC } from '@/hooks/index'

import styles from './index.module.css'

interface SessionProps {
  roomId?: string
}

export const Session = ({ roomId }: SessionProps) => {
  const { pinnedPeerId } = useLocalOption()
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false)
  const { localPeerId, localStream, localStreamRef, remoteStreams, remoteProfiles, peerConnectionRefs } = useWebRTC({
    roomId,
  })
  const { isNavigating, toggleScreenShare } = useScreen({ localStreamRef, peerConnectionRefs })

  const isPinned = pinnedPeerId !== '' && (pinnedPeerId === localPeerId.current || remoteStreams.has(pinnedPeerId))

  const getPinnedVideoStyle = () => ({
    width: '100%',
    height: '100%',
    gridRow: '1 / -1',
    gridColumn: '1 / -1',
    zIndex: 999,
  })

  const getRegularVideoStyle = (index: number, isPinned: boolean) => {
    const gridPosition = isPinned
      ? VIDEO_GRIDS[1 + remoteStreams.size][index + 1]
      : VIDEO_GRIDS[1 + remoteStreams.size][index]

    return {
      width: '100%',
      height: '100%',
      gridRowStart: gridPosition.rowStart,
      gridRowEnd: gridPosition.rowEnd,
      gridColumnStart: gridPosition.colStart,
      gridColumnEnd: gridPosition.colEnd,
    }
  }

  return (
    <div className={styles.container}>
      <div className={isNavigating ? styles.navigating : styles.default}>
        <div className={styles.background}>
          <span className={styles.loadingText}>Sharing screen...</span>
        </div>
      </div>
      <div className={`${styles.wrapper} ${remoteStreams.size > 0 ? styles.multiplePadding : styles.singlePadding}`}>
        <div
          style={
            remoteStreams.size > 0 && pinnedPeerId !== localPeerId.current
              ? getRegularVideoStyle(0, false)
              : getPinnedVideoStyle()
          }
        >
          <LocalVideo
            stream={localStream}
            peerId={localPeerId.current}
            peerIdPosition="bottom-left"
            numOfparticipants={1 + remoteStreams.size}
            showHover={true}
          />
        </div>
        {Array.from(remoteStreams.entries()).map(([peerId, stream], index) =>
          isPinned ? (
            peerId === pinnedPeerId ? (
              <div key={peerId} style={getPinnedVideoStyle()}>
                <RemoteVideo
                  key={peerId}
                  stream={stream}
                  peerId={peerId}
                  numOfparticipants={1 + remoteStreams.size}
                  remoteProfiles={remoteProfiles}
                />
              </div>
            ) : (
              <div key={peerId} style={getRegularVideoStyle(index + 1, true)}>
                <RemoteVideo
                  key={peerId}
                  stream={stream}
                  peerId={peerId}
                  numOfparticipants={1 + remoteStreams.size}
                  remoteProfiles={remoteProfiles}
                />
              </div>
            )
          ) : (
            <div key={peerId} style={getRegularVideoStyle(index + 1, false)}>
              <RemoteVideo
                key={peerId}
                stream={stream}
                peerId={peerId}
                numOfparticipants={1 + remoteStreams.size}
                remoteProfiles={remoteProfiles}
              />
            </div>
          )
        )}
      </div>
      <ChatBox
        roomId={roomId}
        isChatOpen={isChatOpen}
        localPeerId={localPeerId.current}
        toggleChat={() => setIsChatOpen(!isChatOpen)}
      />
      <ControlBar
        roomId={roomId}
        localPeerId={localPeerId.current}
        localStream={localStream}
        isChatOpen={isChatOpen}
        toggleChat={() => setIsChatOpen(!isChatOpen)}
        toggleScreenShare={toggleScreenShare}
      />
    </div>
  )
}
