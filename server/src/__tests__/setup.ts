// import { mongodb, mysql } from '@configs/prisma.config'
import { DeepMockProxy, mockReset } from 'jest-mock-extended'

import { mysql } from '@configs/prisma.config'
// import { PrismaClient as MongoDBPrismaClient } from '@db/mongodb/generated/mongodb'
import { PrismaClient as MySQLPrismaClient } from '@db/mysql/generated/mysql'

jest.mock('@configs/logger.config')
jest.mock('@configs/env.config', () => ({
  dotenv: {
    config: jest.fn(),
  },
}))
jest.mock('@configs/redis.config', () => ({
  redisClient: {
    connect: jest.fn(),
    set: jest.fn(),
    sAdd: jest.fn(),
    sCard: jest.fn(),
  },
}))

beforeEach(() => {
  mockReset(mockMySQL)
  // mockReset(mockMongoDB)
})

export const mockMySQL = mysql as unknown as DeepMockProxy<MySQLPrismaClient>
// export const mockMongoDB = mongodb as unknown as DeepMockProxy<MongoDBPrismaClient>
