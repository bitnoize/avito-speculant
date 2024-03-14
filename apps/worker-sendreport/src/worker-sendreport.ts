import { LoggerConfig } from '@avito-speculant/logger'
import { RedisConfig } from '@avito-speculant/redis'
import { QueueConfig, SendreportConfig } from '@avito-speculant/queue'

export type Config = LoggerConfig &
  RedisConfig &
  QueueConfig &
  SendreportConfig & {
    BOT_TOKEN: string
  }
