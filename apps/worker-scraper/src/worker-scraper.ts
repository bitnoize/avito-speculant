import { LoggerConfig } from '@avito-speculant/logger'
import { RedisConfig } from '@avito-speculant/redis'
import { QueueConfig, ScraperConfig } from '@avito-speculant/queue'

export type Config = LoggerConfig & RedisConfig & QueueConfig & ScraperConfig
