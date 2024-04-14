import { ReportCache } from '../report-cache.js'
import { RedisMethod } from '../../redis.js'

export type FetchReportCacheRequest = {
  reportId: string
}

export type FetchReportCacheResponse = {
  reportCache: ReportCache
}

export type FetchReportCache = RedisMethod<FetchReportCacheRequest, FetchReportCacheResponse>
