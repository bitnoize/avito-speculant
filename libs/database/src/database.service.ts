import * as path from 'path'
import { promises as fs } from 'fs'
import pg from 'pg'
import {
  Kysely,
  PostgresDialect,
  //CamelCasePlugin,
  Migrator,
  FileMigrationProvider
} from 'kysely'
import { Logger } from '@avito-speculant/logger'
import { DatabaseConfig, Database } from './database.js'

/**
 * Get DatabaseConfig from config
 */
export function getDatabaseConfig<T extends DatabaseConfig>(
  config: T
): pg.PoolConfig {
  const databaseConfig: pg.PoolConfig = {
    host: config.POSTGRES_HOST,
    port: config.POSTGRES_PORT,
    database: config.POSTGRES_DATABASE,
    user: config.POSTGRES_USERNAME,
    password: config.POSTGRES_PASSWORD
  }

  return databaseConfig
}

/**
 * Initialize Database instance
 */
export function initDatabase(
  config: pg.PoolConfig,
  logger: Logger
): Kysely<Database> {
  const pool = new pg.Pool(config)

  pg.types.setTypeParser(pg.types.builtins.INT8, (value: string): number =>
    parseInt(value)
  )

  const dialect = new PostgresDialect({
    pool
  })

  const db = new Kysely<Database>({
    dialect,
    //plugins: [new CamelCasePlugin()]
  })

  logger.debug(`Database successfully initialized`)

  return db
}

/*
 * Apply database migrations
 */
export async function migrateToLatest(
  db: Kysely<Database>,
  logger: Logger
): Promise<void> {
  const migrationFolder = new URL('./migrations', import.meta.url).pathname
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder
    })
  })

  const { error, results } = await migrator.migrateToLatest()

  if (results !== undefined) {
    results.forEach((res) => {
      if (res.status === 'Success') {
        logger.info(`Migration '${res.migrationName}' was executed successfully`)
      } else {
        logger.error(`Failed to execute migration '${res.migrationName}'`)
      }
    })
  }

  if (error !== undefined) {
    logger.fatal(error, `Failed to apply database migrations`)
    process.exit(1)
  }

  logger.debug(`Database migrations successfully applied`)
}
