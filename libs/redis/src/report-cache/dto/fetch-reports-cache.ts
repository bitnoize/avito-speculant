import { ReportCache, ReportTopic } from '../report-cache.js'
import { RedisMethod } from '../../redis.js'

export type FetchReportsCacheRequest = {
  categoryId: number
  topic: ReportTopic
}

export type FetchReportsCacheResponse = {
  reportsCache: ReportCache[]
}

export type FetchReportsCache = RedisMethod<FetchReportsCacheRequest, FetchReportsCacheResponse>
