import { REDIS_CACHE_PREFIX } from '../redis.js'

export interface ScraperCache {
  id: string
  urlPath: string
  totalCount: number
  successCount: number
  sizeBytes: number
}

export const scraperCacheKey = (scraperId: string) =>
  [REDIS_CACHE_PREFIX, 'scraper', scraperId].join(':')

export const scrapersIndexKey = () => [REDIS_CACHE_PREFIX, 'scrapers'].join(':')

export const urlPathScraperIdKey = (urlPath: string) =>
  [REDIS_CACHE_PREFIX, 'url_path-scraper', urlPath].join(':')

export const advertScrapersIndexKey = (advertId: number) =>
  [REDIS_CACHE_PREFIX, 'advert-scrapers', advertId].join(':')
