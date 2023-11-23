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

  return (
    <div className={styles.container}>
      <div className={isNavigating ? styles.navigating : styles.default}>
        <div className={styles.background}>
          <span className={styles.loadingText}>Sharing screen...</span>
        </div>
      </div>
      <div
        className={`${styles.wrapper} ${
          isPinned ? styles.pinned : remoteStreams.size > 0 ? styles.multiple : styles.single
        }`}
      >
        {isPinned ? (
          pinnedPeerId === localPeerId.current ? (
            <LocalVideo
              stream={localStream}
              peerId={localPeerId.current}
              peerIdPosition="bottom-left"
              numOfparticipants={1 + remoteStreams.size}
              showHover={true}
            />
          ) : (
            <RemoteVideo
              key={pinnedPeerId}
              stream={remoteStreams.get(pinnedPeerId)!}
              peerId={pinnedPeerId}
              numOfparticipants={1 + remoteStreams.size}
              remoteProfiles={remoteProfiles}
            />
          )
        ) : (
          <>
            <div
              style={{
                width: '100%',
                height: '100%',
                gridRowStart: VIDEO_GRIDS[1 + remoteStreams.size][0].rowStart,
                gridRowEnd: VIDEO_GRIDS[1 + remoteStreams.size][0].rowEnd,
                gridColumnStart: VIDEO_GRIDS[1 + remoteStreams.size][0].colStart,
                gridColumnEnd: VIDEO_GRIDS[1 + remoteStreams.size][0].colEnd,
              }}
            >
              <LocalVideo
                stream={localStream}
                peerId={localPeerId.current}
                peerIdPosition="bottom-left"
                numOfparticipants={1 + remoteStreams.size}
                showHover={true}
              />
            </div>
            {Array.from(remoteStreams.entries()).map(([peerId, stream]: [string, MediaStream], index: number) => {
              return (
                <div
                  key={index}
                  style={{
                    width: '100%',
                    height: '100%',
                    gridRowStart: VIDEO_GRIDS[1 + remoteStreams.size][index + 1].rowStart,
                    gridRowEnd: VIDEO_GRIDS[1 + remoteStreams.size][index + 1].rowEnd,
                    gridColumnStart: VIDEO_GRIDS[1 + remoteStreams.size][index + 1].colStart,
                    gridColumnEnd: VIDEO_GRIDS[1 + remoteStreams.size][index + 1].colEnd,
                  }}
                >
                  <RemoteVideo
                    key={peerId}
                    stream={stream}
                    peerId={peerId}
                    numOfparticipants={1 + remoteStreams.size}
                    remoteProfiles={remoteProfiles}
                  />
                </div>
              )
            })}
          </>
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
