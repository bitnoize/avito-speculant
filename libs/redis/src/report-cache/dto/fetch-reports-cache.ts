import { ReportCache } from '../report-cache.js'
import { RedisMethod } from '../../redis.js'

export type FetchReportsCacheRequest = {
  limit: number
}

export type FetchReportsCacheResponse = {
  reportsCache: ReportCache[]
}

export type FetchReportsCache = RedisMethod<FetchReportsCacheRequest, FetchReportsCacheResponse>
