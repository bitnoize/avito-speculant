import { LoggerConfig, Logger } from '@avito-speculant/logger'
import { RedisConfig } from '@avito-speculant/redis'
import {
  QueueConfig,
  CheckproxyConfig,
  CheckproxyResult,
  CheckproxyJob
} from '@avito-speculant/queue'

export type Config = LoggerConfig & RedisConfig & QueueConfig & CheckproxyConfig

export type ProcessName = (
  config: Config,
  logger: Logger,
  checkproxyJob: CheckproxyJob,
  checkproxyResult: CheckproxyResult
) => Promise<void>

export type TestRequest = (
  targetUrl: string,
  proxyUrl: string,
  timeoutMs: number
) => Promise<TestResponse>

export type TestResponse = {
  statusCode: number
  testingTime: number
  testError?: string
}
