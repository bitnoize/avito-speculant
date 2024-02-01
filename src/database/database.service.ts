import * as path from 'path'
import { promises as fs } from 'fs'
import pg from 'pg'
import {
  Kysely,
  PostgresDialect,
  CamelCasePlugin,
  Migrator,
  FileMigrationProvider
} from 'kysely'
import { Database } from './database.js'
import { Config } from '../config.js'
import { Logger } from '../logger.js'

/**
 * Get DatabaseConfig from config
 */
export function getDatabaseConfig(config: Config): pg.PoolConfig {
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
    plugins: [
      new CamelCasePlugin()
    ]
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
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: './database/migrations'
    })
  })

  const { error, results } = await migrator.migrateToLatest()

  results?.forEach((res) => {
    const message = `Migration: ${res.migrationName} ${res.direction} ${res.status}`

    res.status === 'Success'
      ? logger.info(res, message)
      : logger.error(res, message)
  })

  if (error !== undefined) {
    logger.debug(`Database migrations successfully applied`)
  } else {
    logger.fatal(error, `Failed to apply database migrations`)
    throw error
  }
}
