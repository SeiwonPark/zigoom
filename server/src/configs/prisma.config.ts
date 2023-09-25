import { PrismaClient as MongoDBPrismaClient } from '../../prisma/mongodb/generated/mongodb'
import { PrismaClient as MySQLPrismaClient } from '../../prisma/mysql/generated/mysql'

export const mongodb = new MongoDBPrismaClient()
export const mysql = new MySQLPrismaClient()
