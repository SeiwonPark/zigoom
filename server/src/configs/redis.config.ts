import { createClient } from 'redis'
import { logger } from './logger.config'

export const redisClient = createClient({
  url: 'redis://localhost:6379',
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
