import { ReportCache } from '../report-cache.js'
import { RedisMethod } from '../../redis.js'

export type StampReportCacheRequest = {
  reportId: string
}

export type StampReportCacheResponse = {
  reportCache: ReportCache | undefined
}

export type StampReportCache = RedisMethod<StampReportCacheRequest, StampReportCacheResponse>
