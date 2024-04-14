import { LoggerConfig, Logger } from '@avito-speculant/logger'
import { RedisConfig, Redis } from '@avito-speculant/redis'
import {
  QueueConfig,
  ThrottleConfig,
  ThrottleResult,
  ThrottleJob,
  SendreportQueue
} from '@avito-speculant/queue'

export type Config = LoggerConfig & RedisConfig & QueueConfig & ThrottleConfig

export type ProcessDefault = (
  config: Config,
  logger: Logger,
  redis: Redis,
  throttleJob: ThrottleJob,
  throttleResult: ThrottleResult,
  sendreportQueue: SendreportQueue
) => Promise<void>
