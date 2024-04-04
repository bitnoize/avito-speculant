import { LoggerConfig, Logger } from '@avito-speculant/logger'
import { RedisConfig, Redis, AvitoAdvert } from '@avito-speculant/redis'
import {
  QueueConfig,
  HeraldingConfig,
  HeraldingNameResult,
  HeraldingJob
} from '@avito-speculant/queue'

export type Config = LoggerConfig & RedisConfig & QueueConfig & HeraldingConfig

export type NameProcess = (
  config: Config,
  logger: Logger,
  redis: Redis,
  heraldingJob: HeraldingJob
) => Promise<HeraldingNameResult>
