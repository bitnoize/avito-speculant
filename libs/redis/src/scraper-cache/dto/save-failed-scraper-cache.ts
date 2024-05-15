import { RedisMethod } from '../../redis.js'

export type SaveFailedScraperCacheRequest = {
  scraperId: string
}

export type SaveFailedScraperCacheResponse = void

export type SaveFailedScraperCache = RedisMethod<
  SaveFailedScraperCacheRequest,
  SaveFailedScraperCacheResponse
>
