import { RedisMethod } from '../../redis.js'

export type SaveSuccessScraperCacheRequest = {
  scraperId: string
}

export type SaveSuccessScraperCacheResponse = void

export type SaveSuccessScraperCache = RedisMethod<
  SaveSuccessScraperCacheRequest,
  SaveSuccessScraperCacheResponse
>