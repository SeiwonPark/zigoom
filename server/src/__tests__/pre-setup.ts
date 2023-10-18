import { PrismaClient as MongoDBPrismaClient } from '@db/mongodb/generated/mongodb'
import { PrismaClient as MySQLPrismaClient } from '@db/mysql/generated/mysql'

import { mockDeep } from 'jest-mock-extended'
import 'reflect-metadata'

jest.mock('@configs/prisma.config', () => ({
  __esModule: true,
  mysql: mockDeep<MySQLPrismaClient>(),
  mongodb: mockDeep<MongoDBPrismaClient>(),
}))
