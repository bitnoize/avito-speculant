import { LoggerConfig, Logger } from '@avito-speculant/logger'
import { RedisConfig } from '@avito-speculant/redis'
import { QueueConfig, CheckbotConfig, CheckbotResult, CheckbotJob } from '@avito-speculant/queue'

export type Config = LoggerConfig & RedisConfig & QueueConfig & CheckbotConfig

export type ProcessName = (
  config: Config,
  logger: Logger,
  checkbotJob: CheckbotJob,
  checkbotResult: CheckbotResult
) => Promise<void>

export type TestRequest = (token: string, proxyUrl: string) => Promise<TestResponse>

export type TestResponse = {
  tgFromId: string
  username: string
  testingTime: number
  testError?: string
}
