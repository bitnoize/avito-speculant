import { LoggerConfig, Logger } from '@avito-speculant/logger'
import { DatabaseConfig, KyselyDatabase } from '@avito-speculant/database'
import { RedisConfig, Redis } from '@avito-speculant/redis'
import {
  QueueConfig,
  TreatmentConfig,
  TreatmentNameResult,
  TreatmentJob,
  ScrapingQueue,
  ProxycheckQueue
} from '@avito-speculant/queue'

export type Config = LoggerConfig & DatabaseConfig & RedisConfig & QueueConfig & TreatmentConfig

export type NameProcess = (
  config: Config,
  logger: Logger,
  db: KyselyDatabase,
  redis: Redis,
  pubSub: Redis,
  treatmentJob: TreatmentJob
) => Promise<TreatmentNameResult>

export type NameProcessScraping = (
  config: Config,
  logger: Logger,
  db: KyselyDatabase,
  redis: Redis,
  pubSub: Redis,
  treatmentJob: TreatmentJob,
  scrapingQueue: ScrapingQueue
) => Promise<TreatmentNameResult>

export type NameProcessProxycheck = (
  config: Config,
  logger: Logger,
  db: KyselyDatabase,
  redis: Redis,
  pubSub: Redis,
  treatmentJob: TreatmentJob,
  proxycheckQueue: ProxycheckQueue
) => Promise<TreatmentNameResult>
