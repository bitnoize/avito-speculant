import { RedisMethod } from '../../redis.js'

export type DropAdvertsCacheRequest = {
  scraperId: string
  advertIds: number[]
}

export type DropAdvertsCache = RedisMethod<DropAdvertsCacheRequest, void>
