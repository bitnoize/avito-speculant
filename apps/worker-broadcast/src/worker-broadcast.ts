import { LoggerConfig, Logger } from '@avito-speculant/logger'
import { RedisConfig, Redis, AvitoAdvert } from '@avito-speculant/redis'
import {
  QueueConfig,
  BroadcastConfig,
  BroadcastNameResult,
  BroadcastJob,
  SendreportQueue
} from '@avito-speculant/queue'

export type Config = LoggerConfig & RedisConfig & QueueConfig & BroadcastConfig

export type NameProcessSendreport = (
  config: Config,
  logger: Logger,
  redis: Redis,
  broadcastJob: BroadcastJob,
  sendreportQueue: SendreportQueue
) => Promise<BroadcastNameResult>
