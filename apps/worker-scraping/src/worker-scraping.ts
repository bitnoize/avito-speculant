import { LoggerConfig, Logger } from '@avito-speculant/logger'
import { RedisConfig, Redis } from '@avito-speculant/redis'
import {
  QueueConfig,
  ScrapingConfig,
  ScrapingNameResult,
  ScrapingJob
} from '@avito-speculant/queue'

export type Config = LoggerConfig & RedisConfig & QueueConfig & ScrapingConfig

export type CurlResponse = {
  statusCode: number
  body: Buffer
  error?: string
}

export type CurlRequest = (
  avitoUrl: string,
  proxyUrl: string,
  timeout: number,
  verbose: boolean
) => Promise<CurlResponse | undefined>

export type Process = (
  config: Config,
  logger: Logger,
  redis: Redis,
  scrapingJob: ScrapingJob
) => Promise<ScrapingNameResult>

export interface AvitoDesktop {
  data: unknown
}

export interface AvitoAdv {
  id: number
  title: string
  price: number
  url: string
  age: number
  image: string
}
