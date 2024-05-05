import { REDIS_CACHE_PREFIX } from '../redis.js'

export interface CategoryCache {
  id: number
  userId: number
  scraperId: string
  urlPath: string
  botId: number | null
  isEnabled: boolean
  skipFirst: boolean
  createdAt: number
  updatedAt: number
  queuedAt: number
}

export const categoryKey = (categoryId: number) =>
  [REDIS_CACHE_PREFIX, 'category', categoryId].join(':')

export const userCategoriesKey = (userId: number) =>
  [REDIS_CACHE_PREFIX, 'user-categories', userId].join(':')

export const scraperCategoriesKey = (scraperId: string) =>
  [REDIS_CACHE_PREFIX, 'scraper-categories', scraperId].join(':')
