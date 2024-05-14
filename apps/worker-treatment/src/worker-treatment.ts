import { LoggerConfig, Logger } from '@avito-speculant/logger'
import { DatabaseConfig } from '@avito-speculant/database'
import { RedisConfig } from '@avito-speculant/redis'
import { QueueConfig, TreatmentConfig, TreatmentResult, TreatmentJob } from '@avito-speculant/queue'

export type Config = LoggerConfig & DatabaseConfig & RedisConfig & QueueConfig & TreatmentConfig

export type ProcessName = (
  config: Config,
  logger: Logger,
  treatmentJob: TreatmentJob,
  treatmentResult: TreatmentResult
) => Promise<void>
