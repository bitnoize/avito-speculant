import { RedisMethod } from '../../redis.js'

export type DropScraperCacheRequest = {
  scraperId: string
  avitoUrl: string
}

export type DropScraperCacheResponse = void

export type DropScraperCache = RedisMethod<DropScraperCacheRequest, DropScraperCacheResponse>
