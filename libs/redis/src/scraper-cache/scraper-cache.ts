import { REDIS_CACHE_PREFIX } from '../redis.js'

export interface ScraperCache {
  id: string
  avitoUrl: string
  intervalSec: number
  totalCount: number
  successCount: number
  sizeBytes: number
  time: number
}

export const scraperKey = (scraperId: string) =>
  [REDIS_CACHE_PREFIX, 'scraper', scraperId].join(':')

export const scrapersKey = () => [REDIS_CACHE_PREFIX, 'scrapers'].join(':')

export const avitoUrlScrapersKey = (avitoUrl: string) =>
  [REDIS_CACHE_PREFIX, 'avito_url-scrapers', avitoUrl].join(':')

export const categoryScrapersKey = (categoryId: number) =>
  [REDIS_CACHE_PREFIX, 'category-scrapers', categoryId].join(':')

export const advertScrapersKey = (advertId: number) =>
  [REDIS_CACHE_PREFIX, 'advert-scrapers', advertId].join(':')
