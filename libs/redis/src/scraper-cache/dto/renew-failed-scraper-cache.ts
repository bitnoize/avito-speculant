import { RedisMethod } from '../../redis.js'

export type RenewFailedScraperCacheRequest = {
  scraperId: string
  proxyId: number
  sizeBytes: number
}

export type RenewFailedScraperCacheResponse = void

export type RenewFailedScraperCache = RedisMethod<
  RenewFailedScraperCacheRequest,
  RenewFailedScraperCacheResponse
>
