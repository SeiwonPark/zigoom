import type { Config } from 'jest'

const config: Config = {
  verbose: true,
  preset: 'ts-jest',
  clearMocks: true,
  resetMocks: true,
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  testMatch: ['**/?(*)+(test).ts'],
  transform: {
    '^.+\\.ts$': ['@swc/jest', { configFile: './.swcrc' }],
  },
}

export default config
