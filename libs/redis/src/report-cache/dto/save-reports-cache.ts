import { CategoryReport } from '../report-cache.js'
import { RedisMethod } from '../../redis.js'

export type SaveReportsCacheRequest = {
  scraperId: string
  categoryId: number
  tgFromId: string
  token: string
  categoryReports: CategoryReport[]
}

export type SaveReportsCache = RedisMethod<SaveReportsCacheRequest, void>
