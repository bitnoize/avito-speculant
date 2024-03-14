import { LoggerConfig } from '@avito-speculant/logger'
import { DatabaseConfig } from '@avito-speculant/database'
import { RedisConfig } from '@avito-speculant/redis'

export type Config = LoggerConfig &
  DatabaseConfig &
  RedisConfig & {
    BOT_TOKEN: string
  }
