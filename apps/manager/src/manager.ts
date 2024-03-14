import { LoggerConfig } from '@avito-speculant/logger'
import { DatabaseConfig } from '@avito-speculant/database'
import { RedisConfig } from '@avito-speculant/redis'
import { QueueConfig } from '@avito-speculant/queue'

export type Config = LoggerConfig & DatabaseConfig & RedisConfig & QueueConfig
