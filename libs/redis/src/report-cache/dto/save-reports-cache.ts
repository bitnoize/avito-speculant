import { CategoryReport } from '../report-cache.js'
import { RedisMethod } from '../../redis.js'

export type SaveReportsCacheRequest = {
  categoryId: number
  categoryReports: CategoryReport[]
}

export type SaveReportsCacheResponse = void

export type SaveReportsCache = RedisMethod<SaveReportsCacheRequest, SaveReportsCacheResponse>
