import { LoggerConfig, Logger } from '@avito-speculant/logger'
import { RedisConfig, Redis } from '@avito-speculant/redis'
import {
  QueueConfig,
  ScrapingConfig,
  ScrapingNameResult,
  ScrapingJob
} from '@avito-speculant/queue'

export type Config = LoggerConfig & RedisConfig & QueueConfig & ScrapingConfig

export type CurlImpersonateResponse = {
  statusCode: number
  body: string
  sizeBytes: number
}

export type CurlImpersonateRequest = (
  avitoUrl: string,
  proxyUrl: string,
  timeout: number,
  verbose: boolean
) => Promise<CurlImpersonateResponse | undefined>

export type Process = (
  config: Config,
  logger: Logger,
  redis: Redis,
  scrapingJob: ScrapingJob
) => Promise<ScrapingNameResult>
