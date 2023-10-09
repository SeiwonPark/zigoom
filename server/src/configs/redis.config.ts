import { createClient } from 'redis'

export const redisClient = createClient({
  url: 'redis://localhost:6379',
})

redisClient.connect()

redisClient.on('error', (e) => {
  console.log(`Redis Error: ${e}`)
})

const cleanUp = async () => {
  console.log('Cleaning up resources...')
  await redisClient.quit()
}

// TODO: do I need other handlers?
process.on('exit', cleanUp)
