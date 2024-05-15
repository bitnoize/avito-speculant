import { REDIS_CACHE_PREFIX } from '../redis.js'

export interface ScraperCache {
  id: string
  urlPath: string
  totalCount: number
  successCount: number
}

export const scraperCacheKey = (scraperId: string) =>
  [REDIS_CACHE_PREFIX, 'scraper-cache', scraperId].join(':')

export const targetScraperLinkKey = (urlPath: string) =>
  [REDIS_CACHE_PREFIX, 'target-scraper-link', urlPath].join(':')

export const scrapersIndexKey = () => [REDIS_CACHE_PREFIX, 'scrapers-index'].join(':')
