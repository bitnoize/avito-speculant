import { RedisMethod } from '../../redis.js'

export type SaveFailedScraperCacheRequest = {
  scraperId: string
}

export type SaveFailedScraperCache = RedisMethod<SaveFailedScraperCacheRequest, void>
