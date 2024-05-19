import { RedisMethod } from '../../redis.js'

export type DropScraperCacheRequest = {
  scraperId: string
  urlPath: string
}

export type DropScraperCache = RedisMethod<DropScraperCacheRequest, void>
