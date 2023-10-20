/**
 * Media permissions to initialize local stream.
 */
export const defaultMediaConstraints = {
  audio: true,
  video: true,
}

export const iceServers: { [key: string]: RTCIceServer[] } = {
  // FIXME: ice servers
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }],
}

export const offerOptions: RTCOfferOptions = {
  offerToReceiveVideo: true,
  offerToReceiveAudio: true,
}

// FIXME: to dynamic values
export const VIDEO_GRIDS = [
  [
    { rowStart: 1, rowEnd: 13, colStart: 1, colEnd: 13 }, // n = 0
    { rowStart: 1, rowEnd: 13, colStart: 1, colEnd: 13 },
  ],
  [
    { rowStart: 1, rowEnd: 13, colStart: 1, colEnd: 13 }, // n = 1
    { rowStart: 1, rowEnd: 13, colStart: 1, colEnd: 13 },
  ],
  [
    { rowStart: 3, rowEnd: 11, colStart: 2, colEnd: 7 }, // n = 2
    { rowStart: 3, rowEnd: 11, colStart: 7, colEnd: 12 },
    { rowStart: 3, rowEnd: 11, colStart: 7, colEnd: 12 },
  ],
  [
    { rowStart: 1, rowEnd: 7, colStart: 3, colEnd: 7 }, // n = 3
    { rowStart: 1, rowEnd: 7, colStart: 7, colEnd: 11 },
    { rowStart: 7, rowEnd: 13, colStart: 5, colEnd: 9 },
    { rowStart: 7, rowEnd: 13, colStart: 5, colEnd: 9 },
  ],
  [
    { rowStart: 2, rowEnd: 7, colStart: 3, colEnd: 7 }, // n = 4
    { rowStart: 2, rowEnd: 7, colStart: 7, colEnd: 11 },
    { rowStart: 7, rowEnd: 12, colStart: 3, colEnd: 7 },
    { rowStart: 7, rowEnd: 12, colStart: 7, colEnd: 11 },
    { rowStart: 7, rowEnd: 12, colStart: 7, colEnd: 11 },
  ],
  [
    { rowStart: 2, rowEnd: 7, colStart: 1, colEnd: 5 }, // n = 5
    { rowStart: 2, rowEnd: 7, colStart: 5, colEnd: 9 },
    { rowStart: 2, rowEnd: 7, colStart: 9, colEnd: 13 },
    { rowStart: 7, rowEnd: 12, colStart: 3, colEnd: 7 },
    { rowStart: 7, rowEnd: 12, colStart: 7, colEnd: 11 },
    { rowStart: 7, rowEnd: 12, colStart: 7, colEnd: 11 },
  ],
  [
    { rowStart: 2, rowEnd: 7, colStart: 1, colEnd: 5 }, // n = 6
    { rowStart: 2, rowEnd: 7, colStart: 5, colEnd: 9 },
    { rowStart: 2, rowEnd: 7, colStart: 9, colEnd: 13 },
    { rowStart: 7, rowEnd: 12, colStart: 1, colEnd: 5 },
    { rowStart: 7, rowEnd: 12, colStart: 5, colEnd: 9 },
    { rowStart: 7, rowEnd: 12, colStart: 9, colEnd: 13 },
    { rowStart: 7, rowEnd: 12, colStart: 9, colEnd: 13 },
  ],
  [
    { rowStart: 1, rowEnd: 5, colStart: 1, colEnd: 5 }, // n = 7
    { rowStart: 1, rowEnd: 5, colStart: 5, colEnd: 9 },
    { rowStart: 1, rowEnd: 5, colStart: 9, colEnd: 13 },
    { rowStart: 5, rowEnd: 9, colStart: 1, colEnd: 5 },
    { rowStart: 5, rowEnd: 9, colStart: 5, colEnd: 9 },
    { rowStart: 5, rowEnd: 9, colStart: 9, colEnd: 13 },
    { rowStart: 9, rowEnd: 13, colStart: 5, colEnd: 9 },
    { rowStart: 9, rowEnd: 13, colStart: 5, colEnd: 9 },
  ],
  [
    { rowStart: 1, rowEnd: 5, colStart: 1, colEnd: 5 }, // n = 8
    { rowStart: 1, rowEnd: 5, colStart: 5, colEnd: 9 },
    { rowStart: 1, rowEnd: 5, colStart: 9, colEnd: 13 },
    { rowStart: 5, rowEnd: 9, colStart: 1, colEnd: 5 },
    { rowStart: 5, rowEnd: 9, colStart: 5, colEnd: 9 },
    { rowStart: 5, rowEnd: 9, colStart: 9, colEnd: 13 },
    { rowStart: 9, rowEnd: 13, colStart: 3, colEnd: 7 },
    { rowStart: 9, rowEnd: 13, colStart: 7, colEnd: 11 },
    { rowStart: 9, rowEnd: 13, colStart: 7, colEnd: 11 },
  ],
  [
    { rowStart: 1, rowEnd: 5, colStart: 1, colEnd: 5 }, // n = 9
    { rowStart: 1, rowEnd: 5, colStart: 5, colEnd: 9 },
    { rowStart: 1, rowEnd: 5, colStart: 9, colEnd: 13 },
    { rowStart: 5, rowEnd: 9, colStart: 1, colEnd: 5 },
    { rowStart: 5, rowEnd: 9, colStart: 5, colEnd: 9 },
    { rowStart: 5, rowEnd: 9, colStart: 9, colEnd: 13 },
    { rowStart: 9, rowEnd: 13, colStart: 1, colEnd: 5 },
    { rowStart: 9, rowEnd: 13, colStart: 5, colEnd: 9 },
    { rowStart: 9, rowEnd: 13, colStart: 9, colEnd: 13 },
    { rowStart: 9, rowEnd: 13, colStart: 9, colEnd: 13 },
  ],
]
