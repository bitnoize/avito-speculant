import { REDIS_CACHE_PREFIX } from '../redis.js'

export interface ScraperCache {
  id: string
  avitoUrl: string
  intervalSec: number
  totalCount: number
  successCount: number
}

export const scraperCacheKey = (scraperId: string) =>
  [REDIS_CACHE_PREFIX, 'scraper', scraperId].join(':')

export const scraperCacheAvitoUrlKey = (avitoUrl: string) =>
  [REDIS_CACHE_PREFIX, 'scraper-avito_url', avitoUrl].join(':')

export const scrapersCacheKey = () => [REDIS_CACHE_PREFIX, 'scrapers'].join(':')
