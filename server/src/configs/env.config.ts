import dotenv from 'dotenv'

dotenv.config()

const isDevelopment = process.env.NODE_ENV === 'development'

export const PORT = isDevelopment ? 5001 : process.env.PORT || 5001
export const ALLOWED_ORIGIN = isDevelopment
  ? 'http://localhost:5173'
  : process.env.ALLOWED_ORIGIN || 'http://localhost:5173'
