import { LoggerConfig, Logger } from '@avito-speculant/logger'
import { RedisConfig, Redis, AvitoAdvert } from '@avito-speculant/redis'
import { QueueConfig, ScrapingConfig, ScrapingResult, ScrapingJob } from '@avito-speculant/queue'

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
  absolute: string
}
