import { sleep } from './time'

interface VerifyOptions {
  params: URLSearchParams
}

/**
 * This is for verifying the session if it exists and is full (with max 9 users).
 *
 * @param {VerifyOptions} options - Factors to be verified.
 * @param {string} sessionId - Entering session's id.
 * @returns {Promise<boolean>} Result of session verification.
 */
export const verifySession = async (options: VerifyOptions, sessionId: string | undefined): Promise<boolean> => {
  const adhoc = options.params.get('adhoc')
  const timestamp = options.params.get('ts')

  if (!sessionId || !timestamp || !adhoc) {
    return false
  }

  // FIXME: replace this with the actual request
  await sleep(1000)
  return true
}
