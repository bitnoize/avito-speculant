import { LoggerConfig } from '@avito-speculant/logger'
import { RedisConfig } from '@avito-speculant/redis'
import { ScraperConfig } from '@avito-speculant/queue'

export type Config = LoggerConfig & RedisConfig & ScraperConfig
