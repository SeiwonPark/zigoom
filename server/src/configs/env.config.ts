import dotenv from 'dotenv-flow'

dotenv.config()

/**
 * Server configs
 */
export const PRODUCTION = process.env.NODE_ENV === 'production'
export const PORT = PRODUCTION ? process.env.PORT : 5001
export const ALLOWED_ORIGIN = PRODUCTION ? process.env.ALLOWED_ORIGIN : 'http://localhost:5173'
export const TURN_SECRET_KEY = process.env.TURN_SECRET_KEY || ''
export const TOKEN_KEY = process.env.TOKEN_KEY || ''
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ''

/**
 * AWS Configs
 */
const REDIS_HOST = process.env.REDIS_HOST || 'localhost'
export const REDIS_URL = `redis://${REDIS_HOST}:6379`

export const AWS_BUCKET = process.env.AWS_BUCKET || ''
export const AWS_REGION = process.env.AWS_REGION || ''
export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || ''
export const AWS_ACCESS_SECRET_KEY = process.env.AWS_ACCESS_SECRET_KEY || ''
