import { LoggerConfig, Logger } from '@avito-speculant/logger'
import { RedisConfig } from '@avito-speculant/redis'
import {
  QueueConfig,
  SendreportConfig,
  SendreportResult,
  SendreportJob
} from '@avito-speculant/queue'

export type Config = LoggerConfig & RedisConfig & QueueConfig & SendreportConfig

export type ProcessName = (
  config: Config,
  logger: Logger,
  sendreportJob: SendreportJob,
  sendreportResult: SendreportResult
) => Promise<void>
