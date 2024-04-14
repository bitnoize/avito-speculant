import { LoggerConfig, Logger } from '@avito-speculant/logger'
import { DatabaseConfig, KyselyDatabase } from '@avito-speculant/database'
import { RedisConfig, Redis } from '@avito-speculant/redis'
import {
  QueueConfig,
  TreatmentConfig,
  TreatmentResult,
  TreatmentJob,
  ScrapingQueue,
  ProxycheckQueue,
  BroadcastQueue
} from '@avito-speculant/queue'

export type Config = LoggerConfig & DatabaseConfig & RedisConfig & QueueConfig & TreatmentConfig

export type NameProcess = (
  config: Config,
  logger: Logger,
  db: KyselyDatabase,
  redis: Redis,
  pubSub: Redis,
  treatmentJob: TreatmentJob,
  treatmentResult: TreatmentResult
) => Promise<void>

export type NameProcessBroadcast = (
  config: Config,
  logger: Logger,
  db: KyselyDatabase,
  redis: Redis,
  pubSub: Redis,
  treatmentJob: TreatmentJob,
  treatmentResult: TreatmentResult,
  broadcastQueue: BroadcastQueue
) => Promise<void>

export type NameProcessScraping = (
  config: Config,
  logger: Logger,
  db: KyselyDatabase,
  redis: Redis,
  pubSub: Redis,
  treatmentJob: TreatmentJob,
  treatmentResult: TreatmentResult,
  scrapingQueue: ScrapingQueue
) => Promise<void>

export type NameProcessProxycheck = (
  config: Config,
  logger: Logger,
  db: KyselyDatabase,
  redis: Redis,
  pubSub: Redis,
  treatmentJob: TreatmentJob,
  treatmentResult: TreatmentResult,
  proxycheckQueue: ProxycheckQueue
) => Promise<void>
