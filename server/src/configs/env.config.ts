import dotenv from 'dotenv-flow'

dotenv.config()

export const isDevelopment = process.env.NODE_ENV === 'development'

export const PORT = isDevelopment ? 5001 : process.env.PORT || 5001

export const ALLOWED_ORIGIN = isDevelopment
  ? 'http://localhost:5173'
  : process.env.ALLOWED_ORIGIN || 'http://localhost:5173'

const REDIS_HOST = process.env.REDIS_HOST || 'localhost'
export const REDIS_URL = `redis://${REDIS_HOST}:6379`

export const TURN_SECRET_KEY = process.env.TURN_SECRET_KEY || ''
