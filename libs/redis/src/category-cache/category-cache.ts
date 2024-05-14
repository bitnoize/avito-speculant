import { REDIS_CACHE_PREFIX } from '../redis.js'

export interface CategoryCache {
  id: number
  userId: number
  urlPath: string
  botId: number | null
  scraperId: string
  isEnabled: boolean
  createdAt: number
  updatedAt: number
  queuedAt: number
  reportedAt: number
}

export const categoryCacheKey = (categoryId: number) =>
  [REDIS_CACHE_PREFIX, 'category-cache', categoryId].join(':')

export const userCategoriesIndexKey = (userId: number) =>
  [REDIS_CACHE_PREFIX, 'user-categories-index', userId].join(':')

export const scraperCategoriesIndexKey = (scraperId: string) =>
  [REDIS_CACHE_PREFIX, 'scraper-categories-index', scraperId].join(':')
