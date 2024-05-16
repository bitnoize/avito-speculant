import { LoggerConfig, Logger } from '@avito-speculant/logger'
import { RedisConfig, ScraperAdvert } from '@avito-speculant/redis'
import { QueueConfig, ScrapingConfig, ScrapingResult, ScrapingJob } from '@avito-speculant/queue'

export type Config = LoggerConfig & RedisConfig & QueueConfig & ScrapingConfig

export type ProcessName = (
  config: Config,
  logger: Logger,
  scrapingJob: ScrapingJob,
  scrapingResult: ScrapingResult
) => Promise<void>

export type StealRequest = (
  targetUrl: string,
  proxyUrl: string,
  timeoutMs: number
) => Promise<StealResponse>

export type StealResponse = {
  statusCode: number
  body: Buffer
  stealingTime: number
  stealError?: string
}

export type ParseRequest = (scraperId: string, body: Buffer) => ParseResponse

export type ParseResponse = {
  scraperAdverts: ScraperAdvert[]
  parsingTime: number
  parseError?: string
}

//
// Avito InitialData
//

export type AvitoData = {
  data: AvitoDataData
}

export type AvitoDataData = {
  catalog: AvitoDataDataCatalog
}

export type AvitoDataDataCatalog = {
  items: AvitoDataDataCatalogItem[]
}

export type AvitoDataDataCatalogItem = {
  id: number
  title: string
  description: string
  sortTimeStamp: number
  urlPath: string
  category: AvitoDataDataCatalogItemCategory
  priceDetailed: AvitoDataDataCatalogItemPriceDetailed
  images: AvitoDataDataCatalogItemImage[]
  iva: AvitoDataDataCatalogItemIva
}

export type AvitoDataDataCatalogItemPriceDetailed = {
  value: number
}

export type AvitoDataDataCatalogItemCategory = {
  id: number
  name: string
}

export type AvitoDataDataCatalogItemImage = {
  '208x156': string
  '236x177': string
  '318x238': string
  '416x312': string
  '432x324': string
  '472x354': string
  '636x476': string
  '864x648': string
}

export type AvitoDataDataCatalogItemIva = {
  DateInfoStep: AvitoDataDataCatalogItemIvaDateInfoStep[]
}

export type AvitoDataDataCatalogItemIvaDateInfoStep = {
  payload: AvitoDataDataCatalogItemIvaDateInfoStepPayload
}

export type AvitoDataDataCatalogItemIvaDateInfoStepPayload = {
  absolute?: string
}
