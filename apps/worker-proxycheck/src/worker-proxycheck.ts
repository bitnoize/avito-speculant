import { LoggerConfig, Logger } from '@avito-speculant/logger'
import { RedisConfig, Redis } from '@avito-speculant/redis'
import {
  QueueConfig,
  ProxycheckConfig,
  ProxycheckNameResult,
  ProxycheckJob
} from '@avito-speculant/queue'

export type Config = LoggerConfig & RedisConfig & QueueConfig & ProxycheckConfig

export type NameProcess = (
  config: Config,
  logger: Logger,
  redis: Redis,
  proxycheckJob: ProxycheckJob
) => Promise<ProxycheckNameResult>

export type CurlResponse = {
  statusCode: number
  body: Buffer
  error?: string
}

export type CurlRequest = (
  checkUrl: string,
  proxyUrl: string,
  timeoutMs: number,
  verbose: boolean
) => Promise<CurlResponse>
