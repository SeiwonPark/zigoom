import { createClient } from 'redis'

export const redisClient = createClient({
  legacyMode: true,
  url: 'redis://localhost:6379',
})

redisClient.connect()

redisClient.on('error', (e) => {
  console.log(`Error: ${e}`)
})
