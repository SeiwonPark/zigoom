import type { Config } from 'jest'

const config: Config = {
  verbose: false,
  preset: 'ts-jest',
  clearMocks: true,
  resetMocks: true,
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  detectOpenHandles: true,
  coveragePathIgnorePatterns: [
    'node_modules',
    '__tests__',
    'interfaces',
    'generated',
    'configs',
    '<rootDir>/src/shared/infra/http/server.ts',
  ],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': ['@swc/jest', { configFile: './.swcrc' }],
  },
  moduleNameMapper: {
    '^@modules/(.*)$': '<rootDir>/src/modules/$1',
    '^@handlers/(.*)$': '<rootDir>/src/handlers/$1',
    '^@configs/(.*)$': '<rootDir>/src/configs/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@db/(.*)$': '<rootDir>/prisma/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
  },
  modulePathIgnorePatterns: ['<rootDir>/prisma/mongodb/generated', '<rootDir>/prisma/mysql/generated'],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/pre-setup.ts', '<rootDir>/src/__tests__/setup.ts'],
}

export default config
