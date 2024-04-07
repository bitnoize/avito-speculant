import { Bot } from 'grammy'
import { LoggerConfig, Logger } from '@avito-speculant/logger'
import { RedisConfig, Redis } from '@avito-speculant/redis'
import {
  QueueConfig,
  SendreportConfig,
  SendreportResult,
  SendreportJob
} from '@avito-speculant/queue'

export type Config = LoggerConfig &
  RedisConfig &
  QueueConfig &
  SendreportConfig & {
    BOT_TOKEN: string
  }

export type ProcessDefault = (
  config: Config,
  logger: Logger,
  redis: Redis,
  sendreportJob: SendreportJob,
  sendreportResult: SendreportResult,
  bot: Bot
) => Promise<void>
