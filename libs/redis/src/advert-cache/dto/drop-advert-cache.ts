import { RedisMethod } from '../../redis.js'

export type DropAdvertCacheRequest = {
  advertId: number
  scraperId: string
  categoryId: number
}

export type DropAdvertCacheResponse = void

export type DropAdvertCache = RedisMethod<DropAdvertCacheRequest, DropAdvertCacheResponse>
