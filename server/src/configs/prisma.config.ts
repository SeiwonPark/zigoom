import { PrismaClient as MongoDBPrismaClient } from '@prisma/mongodb/generated/mongodb'
import { PrismaClient as MySQLPrismaClient } from '@prisma/mysql/generated/mysql'

declare global {
  var mongodbPrisma: MongoDBPrismaClient | undefined
  var mysqlPrisma: MySQLPrismaClient | undefined
}

const mongodb = global.mongodbPrisma || new MongoDBPrismaClient()
const mysql = global.mysqlPrisma || new MySQLPrismaClient()

if (process.env.NODE_ENV === 'development') {
  global.mongodbPrisma = mongodb
  global.mysqlPrisma = mysql
}

export { mongodb, mysql }
