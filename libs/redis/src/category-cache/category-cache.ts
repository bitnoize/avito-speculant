import { REDIS_CACHE_PREFIX } from '../redis.js'

export interface CategoryCache {
  id: number
  userId: number
  scraperId: string
  avitoUrl: string
}

export const categoryCacheKey = (categoryId: number) =>
  [REDIS_CACHE_PREFIX, 'category', categoryId].join(':')

export const userCategoriesCacheKey = (userId: number) =>
  [REDIS_CACHE_PREFIX, 'user-categories', userId].join(':')

export const scraperCategoriesCacheKey = (scraperId: string) =>
  [REDIS_CACHE_PREFIX, 'scraper-categories', scraperId].join(':')
