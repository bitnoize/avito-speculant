import { AvitoReport } from '../report-cache.js'
import { RedisMethod } from '../../redis.js'

export type SaveReportsCacheRequest = {
  avitoReports: AvitoReport[]
}

export type SaveReportsCacheResponse = void

export type SaveReportsCache = RedisMethod<SaveReportsCacheRequest, SaveReportsCacheResponse>
