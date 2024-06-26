import * as path from 'path'
import { promises as fs } from 'fs'
import pg from 'pg'
import {
  PostgresDialect,
  Logger as KyselyLogger,
  Kysely,
  Migrator,
  FileMigrationProvider
} from 'kysely'
import { Logger } from '@avito-speculant/logger'
import { DatabaseConfig, Database } from './database.js'

pg.types.setTypeParser(pg.types.builtins.INT8, (value: string): number => parseInt(value, 10))
pg.types.setTypeParser(pg.types.builtins.TIMESTAMP, (value: string): number => Date.parse(value))
pg.types.setTypeParser(pg.types.builtins.TIMESTAMPTZ, (value: string): number => Date.parse(value))

/**
 * Get DatabaseConfig from config
 */
export function getDatabaseConfig<T extends DatabaseConfig>(config: T): pg.ClientConfig {
  return {
    host: config.POSTGRES_HOST,
    port: config.POSTGRES_PORT,
    database: config.POSTGRES_DATABASE,
    user: config.POSTGRES_USERNAME,
    password: config.POSTGRES_PASSWORD
  }
}

/**
 * Initialize database instance
 */
export function initDatabase(config: pg.PoolConfig, logger: Logger): Kysely<Database> {
  const pool = new pg.Pool({
    ...config
  })

  const dialect = new PostgresDialect({
    pool,
    onCreateConnection: async () => {
      logger.debug(`Database successfully connected`)
    }
  })

  const log: KyselyLogger = async (event) => {
    const { sql, parameters } = event.query
    const duration = event.queryDurationMillis.toFixed(2)

    if (event.level === 'query') {
      const data = {
        sql,
        duration
      }

      logger.debug(data, `Database query event log`)
    } else if (event.level === 'error') {
      if (event.error instanceof Error) {
        const data = {
          sql,
          parameters
        }

        logger.error(data, event.error.stack ?? event.error.message)
      } else {
        const data = {
          sql,
          parameters,
          error: event.error
        }

        logger.error(data, `Database error event log`)
      }
    }
  }

  const db = new Kysely<Database>({
    dialect,
    log
  })

  return db
}

/*
 * Apply database migrations
 */
export async function migrateToLatest(db: Kysely<Database>, logger: Logger): Promise<void> {
  const migrationFolder = new URL('./migrations', import.meta.url).pathname
  const provider = new FileMigrationProvider({
    fs,
    path,
    migrationFolder
  })
  const migrator = new Migrator({
    db,
    provider
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
    process.exit(1)
  }

  logger.debug(`All database migrations successfully applied`)
}

/*
 * Close database connection
 */
export async function closeDatabase(db: Kysely<Database>): Promise<void> {
  await db.destroy()
}
