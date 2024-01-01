import { createClient } from 'redis'

import { REDIS_URL } from '@configs/env.config'
import { logger } from '@configs/logger.config'

export const redisClient = createClient({
  url: REDIS_URL,
})

redisClient.connect()

redisClient.on('error', (e) => {
  logger.error(`Redis Error: ${e}`)
})

const cleanUp = async () => {
  logger.info('Cleaning up resources...')
  await redisClient.quit()
}

// TODO: do I need other handlers?
process.on('exit', cleanUp)
