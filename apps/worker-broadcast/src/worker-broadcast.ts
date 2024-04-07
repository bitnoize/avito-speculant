import { LoggerConfig, Logger } from '@avito-speculant/logger'
import { RedisConfig, Redis } from '@avito-speculant/redis'
import {
  QueueConfig,
  BroadcastConfig,
  BroadcastResult,
  BroadcastJob,
  SendreportQueue
} from '@avito-speculant/queue'

export type Config = LoggerConfig & RedisConfig & QueueConfig & BroadcastConfig

export type ProcessDefault = (
  config: Config,
  logger: Logger,
  redis: Redis,
  broadcastJob: BroadcastJob,
  broadcastResult: BroadcastResult,
  sendreportQueue: SendreportQueue
) => Promise<void>