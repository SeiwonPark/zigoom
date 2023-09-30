import type { Config } from 'jest'

const config: Config = {
  verbose: true,
  preset: 'ts-jest',
  clearMocks: true,
  resetMocks: true,
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': ['@swc/jest', { configFile: './.swcrc' }],
  },
  moduleNameMapper: {
    '^@modules/(.*)$': '<rootDir>/src/modules/$1',
    '^@configs/(.*)$': '<rootDir>/src/configs/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@prisma/(.*)$': '<rootDir>/prisma/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
  },
}

export default config
