import { RedisMethod } from '../../redis.js'

export type DropScraperCacheRequest = {
  scraperId: string
  urlPath: string
}

export type DropScraperCacheResponse = void

export type DropScraperCache = RedisMethod<DropScraperCacheRequest, DropScraperCacheResponse>
