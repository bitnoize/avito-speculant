import { LoggerConfig, Logger } from '@avito-speculant/logger'
import { RedisConfig, Redis, AvitoAdvert } from '@avito-speculant/redis'
import {
  QueueConfig,
  ScrapingConfig,
  ScrapingNameResult,
  ScrapingJob
} from '@avito-speculant/queue'

export type Config = LoggerConfig & RedisConfig & QueueConfig & ScrapingConfig

export type NameProcess = (
  config: Config,
  logger: Logger,
  redis: Redis,
  scrapingJob: ScrapingJob
) => Promise<ScrapingNameResult>

export type CurlResponse = {
  statusCode: number
  body: Buffer
  error?: string
}

export type CurlRequest = (
  url: string,
  proxyUrl: string,
  timeoutMs: number,
  verbose: boolean
) => Promise<CurlResponse>

export type ParseResult = {
  avitoAdverts: AvitoAdvert[]
  error?: string
}

export type ParseAttempt = (body: Buffer) => ParseResult

export interface AvitoDesktop {
  data: AvitoDesktopData
}

export interface AvitoDesktopData {
  catalog: AvitoDesktopDataCatalog
}

export interface AvitoDesktopDataCatalog {
  items: AvitoDesktopDataCatalogItem[]
}

export interface AvitoDesktopDataCatalogItem {
  id: number
  title: string
}
