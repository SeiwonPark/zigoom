import { mongodb, mysql } from '@configs/prisma.config'
import { PrismaClient as MongoDBPrismaClient } from '@db/mongodb/generated/mongodb'
import { PrismaClient as MySQLPrismaClient } from '@db/mysql/generated/mysql'

import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended'
import 'reflect-metadata'

jest.mock('@configs/logger.config')
jest.mock('@configs/prisma.config', () => ({
  __esModule: true,
  mysql: mockDeep<MySQLPrismaClient>(),
  mongodb: mockDeep<MongoDBPrismaClient>(),
}))
jest.mock('@configs/redis.config', () => ({
  redisClient: {
    connect: jest.fn(),
    set: jest.fn(),
    sAdd: jest.fn(),
    sCard: jest.fn(),
  },
}))

jest.spyOn(global.console, 'log').mockImplementation(() => jest.fn())

beforeEach(() => {
  mockReset(mockMySQL)
  mockReset(mockMongoDB)
})

export const mockMySQL = mysql as unknown as DeepMockProxy<MySQLPrismaClient>
export const mockMongoDB = mongodb as unknown as DeepMockProxy<MongoDBPrismaClient>
