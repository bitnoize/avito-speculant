import { REDIS_CACHE_PREFIX } from '../redis.js'

export interface ScraperCache {
  id: string
  urlPath: string
  totalCount: number
  successCount: number
  sizeBytes: number
}

export const scraperCacheKey = (scraperId: string) =>
  [REDIS_CACHE_PREFIX, 'scraper-cache', scraperId].join(':')

export const urlPathScraperLinkKey = (urlPath: string) =>
  [REDIS_CACHE_PREFIX, 'url_path-scraper-link', urlPath].join(':')

export const scrapersIndexKey = () => [REDIS_CACHE_PREFIX, 'scrapers-index'].join(':')

export const advertScrapersIndexKey = (advertId: number) =>
  [REDIS_CACHE_PREFIX, 'advert-scrapers-index', advertId].join(':')
