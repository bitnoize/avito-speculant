import { LoggerConfig, Logger } from '@avito-speculant/logger'
import { DatabaseConfig, KyselyDatabase } from '@avito-speculant/database'
import { RedisConfig, Redis } from '@avito-speculant/redis'
import {
  QueueConfig,
  HeartbeatConfig,
  HeartbeatStepResult,
  TreatmentQueue,
  ScrapingQueue
} from '@avito-speculant/queue'

export type Config = LoggerConfig & DatabaseConfig & RedisConfig & QueueConfig & HeartbeatConfig

export type ProcessTreatment = (
  config: Config,
  logger: Logger,
  db: KyselyDatabase,
  treatmentQueue: TreatmentQueue
) => Promise<HeartbeatStepResult>

export type ProcessScraping = (
  config: Config,
  logger: Logger,
  redis: Redis,
  scrapingQueue: ScrapingQueue
) => Promise<HeartbeatStepResult>
