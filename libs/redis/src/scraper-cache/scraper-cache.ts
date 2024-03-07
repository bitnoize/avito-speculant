import { REDIS_CACHE_PREFIX } from '../redis.js'

export interface ScraperCache {
  jobId: string
  avitoUrl: string
  intervalSec: number
  totalCount: number
  successCount: number
}

export const scraperCacheKey = (scraperJobId: string) =>
  [REDIS_CACHE_PREFIX, 'scraper', scraperJobId].join(':')

export const scrapersCacheKey = () => [REDIS_CACHE_PREFIX, 'scrapers'].join(':')
