import { LoggerConfig, Logger } from '@avito-speculant/logger'
import { DatabaseConfig } from '@avito-speculant/database'
import { RedisConfig } from '@avito-speculant/redis'
import { QueueConfig } from '@avito-speculant/queue'

export type Config = LoggerConfig & DatabaseConfig & RedisConfig & QueueConfig

export type InitSubcommands = (config: Config, logger: Logger) => any
export type InitCommand = (config: Config, logger: Logger) => any

export const DEFAULT_LIMIT = 100
