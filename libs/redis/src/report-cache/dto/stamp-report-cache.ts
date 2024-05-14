import { ReportCache } from '../report-cache.js'
import { RedisMethod } from '../../redis.js'

export type StampReportCacheRequest = {
  categoryId: number
  advertId: number
}

export type StampReportCacheResponse = {
  reportCache: ReportCache | undefined
}

export type StampReportCache = RedisMethod<StampReportCacheRequest, StampReportCacheResponse>
