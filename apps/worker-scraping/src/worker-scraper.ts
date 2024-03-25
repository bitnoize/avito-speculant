import { LoggerConfig, Logger } from '@avito-speculant/logger'
import { RedisConfig, Redis } from '@avito-speculant/redis'
import {
  QueueConfig,
  ScraperConfig,
  ScrapingNameResult
  ScrapingJob
} from '@avito-speculant/queue'

export type Config = LoggerConfig & RedisConfig & QueueConfig & ScraperConfig

export type ScrapingCurlImpersonateResponse = {
  statusCode: number
  body: string
}

export type ScrapingCurlImpersonateRequest = (
  avitoUrl: string,
  proxyUrl: string,
  timeout: number,
  verbose: boolean
) => Promise<ScrapingCurlImpersonateResponse | undefined>

export type Process = (
  config: Config,
  logger: Logger,
  redis: Redis,
  scrapingJob: ScrapingJob
) => Promise<ScrapingNameResult>
