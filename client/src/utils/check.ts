interface VerifyOptions {
  params: URLSearchParams
}

export const verifySession = async ({ params }: VerifyOptions, sessionId: string | undefined): Promise<boolean> => {
  const adhoc = params.get('adhoc')
  const timestamp = params.get('ts')

  if (!sessionId || !timestamp || !adhoc) {
    return false
  }

  // FIXME: replace this with the actual request
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return false
}
