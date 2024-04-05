import { RedisMethod } from '../../redis.js'

export type SaveScraperCategoryCacheRequest = {
  categoryId: number
  userId: number
  scraperId: string
  avitoUrl: string
  intervalSec: number
}

export type SaveScraperCategoryCacheResponse = void

export type SaveScraperCategoryCache = RedisMethod<
  SaveScraperCategoryCacheRequest,
  SaveScraperCategoryCacheResponse
>
