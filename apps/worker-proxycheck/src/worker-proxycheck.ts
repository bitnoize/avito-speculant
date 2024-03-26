import { LoggerConfig, Logger } from '@avito-speculant/logger'
import { RedisConfig, Redis } from '@avito-speculant/redis'
import {
  QueueConfig,
  ProxycheckConfig,
  ProxycheckNameResult,
  ProxycheckJob
} from '@avito-speculant/queue'

export type Config = LoggerConfig & RedisConfig & QueueConfig & ProxycheckConfig

export type CurlImpersonateResponse = {
  statusCode: number
  body: string
  sizeBytes: number
}

export type CurlImpersonateRequest = (
  checkUrl: string,
  proxyUrl: string,
  timeout: number,
  verbose: boolean
) => Promise<CurlImpersonateResponse | undefined>

export type Process = (
  config: Config,
  logger: Logger,
  redis: Redis,
  proxycheckJob: ProxycheckJob
) => Promise<ProxycheckNameResult>
