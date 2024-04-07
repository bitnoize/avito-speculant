import { LoggerConfig, Logger } from '@avito-speculant/logger'
import { RedisConfig, Redis, AvitoAdvert } from '@avito-speculant/redis'
import {
  QueueConfig,
  ScrapingConfig,
  ScrapingResult,
  ScrapingJob
} from '@avito-speculant/queue'

export type Config = LoggerConfig & RedisConfig & QueueConfig & ScrapingConfig

export type ProcessDefault = (
  config: Config,
  logger: Logger,
  redis: Redis,
  scrapingJob: ScrapingJob,
  scrapingResult: ScrapingResult
) => Promise<void>

export type CurlResponse = {
  statusCode: number
  body: Buffer
  sizeBytes: number
  durationTime: number
  error?: string
}

export type CurlRequest = (
  url: string,
  proxyUrl: string,
  timeoutMs: number,
  verbose: boolean
) => Promise<CurlResponse>

export type CurlRequestArgs = [string, string, number, boolean]

export type ParseResult = {
  avitoAdverts: AvitoAdvert[]
  totalAdverts: number
  durationTime: number
  error?: string
}

export type ParseAttempt = (body: Buffer) => ParseResult

//
// Avito InitialData
//

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
