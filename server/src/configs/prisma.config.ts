import { PrismaClient as MongoDBPrismaClient } from '@db/mongodb/generated/mongodb'
import { PrismaClient as MySQLPrismaClient } from '@db/mysql/generated/mysql'

export const mysql = new MySQLPrismaClient()
export const mongodb = new MongoDBPrismaClient()
