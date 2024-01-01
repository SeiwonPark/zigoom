// import { PrismaClient as MongoDBPrismaClient } from '@db/mongodb/generated/mongodb'
import { mockDeep } from 'jest-mock-extended'
import 'reflect-metadata'

import { PrismaClient as MySQLPrismaClient } from '@db/mysql/generated/mysql'

jest.mock('@configs/prisma.config', () => ({
  __esModule: true,
  mysql: mockDeep<MySQLPrismaClient>(),
  // mongodb: mockDeep<MongoDBPrismaClient>(),
}))
