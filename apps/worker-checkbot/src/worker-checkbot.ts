import { LoggerConfig, Logger } from '@avito-speculant/logger'
import { RedisConfig, Redis } from '@avito-speculant/redis'
import {
  QueueConfig,
  CheckbotConfig,
  CheckbotResult,
  CheckbotJob
} from '@avito-speculant/queue'

export type Config = LoggerConfig & RedisConfig & QueueConfig & CheckbotConfig

export type ProcessDefault = (
  config: Config,
  logger: Logger,
  checkbotJob: CheckbotJob,
  checkbotResult: CheckbotResult
) => Promise<void>
