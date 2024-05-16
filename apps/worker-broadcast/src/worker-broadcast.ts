import { LoggerConfig, Logger } from '@avito-speculant/logger'
import { RedisConfig } from '@avito-speculant/redis'
import { QueueConfig, BroadcastConfig, BroadcastResult, BroadcastJob } from '@avito-speculant/queue'

export type Config = LoggerConfig & RedisConfig & QueueConfig & BroadcastConfig

export type ProcessName = (
  config: Config,
  logger: Logger,
  broadcastJob: BroadcastJob,
  broadcastResult: BroadcastResult
) => Promise<void>
