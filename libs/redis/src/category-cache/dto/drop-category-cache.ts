import { RedisMethod } from '../../redis.js'

export type DropCategoryCacheRequest = {
  categoryId: number
  userId: number
  scraperId: string
}

export type DropCategoryCacheResponse = void

export type DropCategoryCache = RedisMethod<DropCategoryCacheRequest, DropCategoryCacheResponse>
