import { RedisMethod } from '../../redis.js'

export type SaveCategoryCacheRequest = {
  categoryId: number
  userId: number
  urlPath: string
  botId: number | null
  scraperId: string
  isEnabled: boolean
  createdAt: number
  updatedAt: number
  queuedAt: number
}

export type SaveCategoryCache = RedisMethod<SaveCategoryCacheRequest, void>
