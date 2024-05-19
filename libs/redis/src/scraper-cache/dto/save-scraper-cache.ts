import { RedisMethod } from '../../redis.js'

export type SaveScraperCacheRequest = {
  scraperId: string
  urlPath: string
}

export type SaveScraperCache = RedisMethod<SaveScraperCacheRequest, void>
