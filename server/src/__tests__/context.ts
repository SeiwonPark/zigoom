import { PrismaClient } from '@prisma/mysql/generated/mysql'
import { OAuth2Client } from 'google-auth-library'
import { mockDeep, DeepMockProxy } from 'jest-mock-extended'

export type Context = {
  prisma: PrismaClient
  oauthClient: OAuth2Client
}

export type MockContext = {
  prisma: DeepMockProxy<PrismaClient>
  oauthClient: DeepMockProxy<OAuth2Client>
}

export const createMockContext = (): MockContext => {
  return {
    prisma: mockDeep<PrismaClient>(),
    oauthClient: mockDeep<OAuth2Client>(),
  }
}
