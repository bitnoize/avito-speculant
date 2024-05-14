import { RedisMethod } from '../../redis.js'

export type DropAdvertsCacheRequest = {
  scraperId: string
  advertIds: number[]
}

export type DropAdvertsCacheResponse = void

export type DropAdvertsCache = RedisMethod<DropAdvertsCacheRequest, DropAdvertsCacheResponse>
