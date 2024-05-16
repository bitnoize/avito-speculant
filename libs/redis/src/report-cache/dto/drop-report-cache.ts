import { RedisMethod } from '../../redis.js'

export type DropReportCacheRequest = {
  categoryId: number
  advertId: number
}

export type DropReportCacheResponse = void

export type DropReportCache = RedisMethod<DropReportCacheRequest, DropReportCacheResponse>
