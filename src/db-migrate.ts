import config from './config.js'
import { getLoggerOptions, initLogger } from './logger.js'
import {
  getDatabaseConfig,
  initDatabase,
  migrateToLatest
} from './database/index.js'

async function bootstrap(): Promise<void> {
  const loggerOptions = getLoggerOptions(config)
  const logger = initLogger(loggerOptions)

  const databaseConfig = getDatabaseConfig(config)
  const db = initDatabase(databaseConfig, logger)

  await migrateToLatest(db, logger)

  await db.destroy()
}

bootstrap()
