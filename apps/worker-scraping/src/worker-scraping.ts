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

export type AvitoDesktop = {
  data: AvitoDesktopData
}

export type AvitoDesktopData = {
  catalog: AvitoDesktopDataCatalog
}

export type AvitoDesktopDataCatalog = {
  items: AvitoDesktopDataCatalogItem[]
}

export type AvitoDesktopDataCatalogItem = {
  id?: number
  title?: string
  description?: string
  sortTimeStamp?: number
  urlPath?: string
  category?: AvitoDesktopDataCatalogItemCategory
  priceDetailed?: AvitoDesktopDataCatalogItemPriceDetailed
  images?: AvitoDesktopDataCatalogItemImage[]
  iva?: AvitoDesktopDataCatalogItemIva
}

export type AvitoDesktopDataCatalogItemCategory = {
  id?: number
  name?: string
}

export type AvitoDesktopDataCatalogItemPriceDetailed = {
  value?: number
}

export type AvitoDesktopDataCatalogItemImage = {
  '208x156'?: string
  '236x177'?: string
  '318x238'?: string
  '416x312'?: string
  '432x324'?: string
  '472x354'?: string
  '636x476'?: string
  '864x648'?: string
}

export type AvitoDesktopDataCatalogItemIva = {
  DateInfoStep?: AvitoDesktopDataCatalogItemIvaDateInfoStep[]
}

export type AvitoDesktopDataCatalogItemIvaDateInfoStep = {
  payload?: AvitoDesktopDataCatalogItemIvaDateInfoStepPayload
}

export type AvitoDesktopDataCatalogItemIvaDateInfoStepPayload = {
  absolute?: string
}
