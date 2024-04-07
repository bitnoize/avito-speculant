import { LoggerConfig, Logger } from '@avito-speculant/logger'
import { DatabaseConfig, KyselyDatabase } from '@avito-speculant/database'
import { RedisConfig } from '@avito-speculant/redis'
import {
  QueueConfig,
  HeartbeatConfig,
  HeartbeatResult,
  HeartbeatJob,
  TreatmentQueue
} from '@avito-speculant/queue'

export type Config = LoggerConfig & DatabaseConfig & RedisConfig & QueueConfig & HeartbeatConfig

export type StepProcessTreatment = (
  config: Config,
  logger: Logger,
  db: KyselyDatabase,
  heartbeatJob: HeartbeatJob,
  heartbeatResult: HeartbeatResult,
  treatmentQueue: TreatmentQueue
) => Promise<void>
