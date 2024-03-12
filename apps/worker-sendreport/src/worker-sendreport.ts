import { LoggerConfig } from '@avito-speculant/logger'
import { RedisConfig } from '@avito-speculant/redis'
import { SendreportConfig } from '@avito-speculant/queue'

export type Config = LoggerConfig & RedisConfig & SendreportConfig & {
  BOT_TOKEN: string
}
