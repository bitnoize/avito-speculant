import { RedisMethod } from '../../redis.js'

export type RenewSuccessScraperCacheRequest = {
  scraperId: string
  proxyId: number
  sizeBytes: number
}

export type RenewSuccessScraperCacheResponse = void

export type RenewSuccessScraperCache = RedisMethod<
  RenewSuccessScraperCacheRequest,
  RenewSuccessScraperCacheResponse
>
