import { REDIS_CACHE_PREFIX } from '../redis.js'

export interface CategoryCache {
  id: number
  userId: number
  urlPath: string
  botId: number | null
  scraperId: string
  isEnabled: boolean
  firstTime: boolean
  createdAt: number
  updatedAt: number
  queuedAt: number
}

export const categoryCacheKey = (categoryId: number) =>
  [REDIS_CACHE_PREFIX, 'category-cache', categoryId].join(':')

export const userCategoriesIndexKey = (userId: number) =>
  [REDIS_CACHE_PREFIX, 'user-categories-index', userId].join(':')

export const scraperEnabledCategoriesIndexKey = (scraperId: string) =>
  [REDIS_CACHE_PREFIX, 'scraper-enabled-categories-index', scraperId].join(':')
