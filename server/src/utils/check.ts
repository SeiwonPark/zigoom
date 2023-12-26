/**
 * Runs only for checking if envs are fully set before running the server for development/production.
 * Additional envs are neede for running `docker-compose*.yml` files.
 */
import assert from 'assert'
import { readFileSync, readdirSync } from 'fs'
import { join, resolve } from 'path'

;(() => {
  const findEnvFiles = (directory: string, pattern: string): string[] => {
    try {
      const files = readdirSync(directory)
      return files.filter((file) => file.startsWith(pattern)).map((file) => join(directory, file))
    } catch (err) {
      console.error(`\n\x1b[0;31m✘\x1b[0m Error reading directory: ${err}\n`)
      return []
    }
  }

  const parseEnvsFromFile = (filePath: string): Record<string, string> => {
    const envs: { [key: string]: string } = {}

    try {
      const data = readFileSync(filePath, 'utf8')

      data.split('\n').forEach((line) => {
        if (line.trim().startsWith('#')) {
          return
        }

        const [key, value] = line.split('=')
        if (key && value) {
          envs[key.trim()] = value.trim()
        }
      })
    } catch (err) {
      console.error(`\n\x1b[0;31m✘\x1b[0m Error reading .env file: ${err}\n`)
    }

    return envs
  }

  const directory = resolve(__dirname, '../../')
  /**
   * Parses all the .env* files to check if all envs are loaded.
   */
  const envFiles = findEnvFiles(directory, '.env')

  envFiles.forEach((envFilePath: string) => {
    const env = parseEnvsFromFile(envFilePath)

    // FIXME: Should be added later
    // assert(env.MONGODB_DATABASE_URL, "Environment variable 'MONGODB_DATABASE_URL' is required")
    assert(env.MYSQL_DATABASE_URL, "\x1b[0;31mEnvironment variable 'MYSQL_DATABASE_URL' is required.\x1b[0m")
    assert(env.GOOGLE_CLIENT_ID, "\x1b[0;31mEnvironment variable 'GOOGLE_CLIENT_ID' is required.\x1b[0m")
    assert(env.REDIS_HOST, "\x1b[0;31mEnvironment variable 'REDIS_HOST' is required.\x1b[0m")
    assert(env.ALLOWED_ORIGIN, "\x1b[0;31mEnvironment variable 'ALLOWED_ORIGIN' is required.\x1b[0m")
    assert(env.NODE_ENV, "\x1b[0;31mEnvironment variable 'NODE_ENV' is required.\x1b[0m")
    assert(env.AWS_API_IMAGE, "\x1b[0;31mEnvironment variable 'AWS_API_IMAGE' is required.\x1b[0m")
    assert(env.TURN_SECRET_KEY, "\x1b[0;31mEnvironment variable 'TURN_SECRET_KEY' is required.")
  })

  console.log('\n\x1b[0;32m✔\x1b[0m Environment variables are all set.\n')
})()
