import { LoggerConfig, Logger } from '@avito-speculant/logger'
import { DatabaseConfig, KyselyDatabase } from '@avito-speculant/database'
import { RedisConfig, Redis } from '@avito-speculant/redis'
import {
  QueueConfig,
  TreatmentConfig,
  TreatmentNameResult,
  TreatmentJob,
  ProxycheckQueue
} from '@avito-speculant/queue'

export type Config = LoggerConfig & DatabaseConfig & RedisConfig & QueueConfig & TreatmentConfig

export type Process = (
  config: Config,
  logger: Logger,
  db: KyselyDatabase,
  redis: Redis,
  pubSub: Redis,
  treatmentJob: TreatmentJob
) => Promise<TreatmentNameResult>

export type ProcessProxycheck = (
  config: Config,
  logger: Logger,
  db: KyselyDatabase,
  redis: Redis,
  pubSub: Redis,
  treatmentJob: TreatmentJob,
  proxycheckQueue: ProxycheckQueue
) => Promise<TreatmentNameResult>
