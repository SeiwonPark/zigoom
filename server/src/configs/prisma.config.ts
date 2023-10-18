import { PrismaClient as MongoDBPrismaClient } from '@db/mongodb/generated/mongodb'
import { PrismaClient as MySQLPrismaClient } from '@db/mysql/generated/mysql'

const globalForPrisma = globalThis as unknown as { mysql: MySQLPrismaClient; mongodb: MongoDBPrismaClient }

export const mysql = globalForPrisma.mysql || new MySQLPrismaClient()
export const mongodb = globalForPrisma.mongodb || new MongoDBPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.mysql = mysql
  globalForPrisma.mongodb = mongodb
}
