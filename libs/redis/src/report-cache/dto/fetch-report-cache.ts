import { ReportCache } from '../report-cache.js'
import { RedisMethod } from '../../redis.js'

export type FetchReportCacheRequest = {
  categoryId: number
  advertId: number
}

export type FetchReportCacheResponse = {
  reportCache: ReportCache
}

export type FetchReportCache = RedisMethod<FetchReportCacheRequest, FetchReportCacheResponse>
