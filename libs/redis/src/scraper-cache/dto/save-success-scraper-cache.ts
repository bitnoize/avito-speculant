import { RedisMethod } from '../../redis.js'

export type SaveSuccessScraperCacheRequest = {
  scraperId: string
}

export type SaveSuccessScraperCache = RedisMethod<SaveSuccessScraperCacheRequest, void>
