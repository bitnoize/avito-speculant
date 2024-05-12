import { REDIS_CACHE_PREFIX } from '../redis.js'

export interface ReportCache {
  id: string
  categoryId: number
  advertId: number
  tgFromId: string
  postedAt: number
  attempt: number
  time: number
}

export type AvitoReport = [
  number, // categoryId
  number, // advertId
  string, // tgFromId
  number // postedAt
]

export const reportCacheKey = (reportId: string) =>
  [REDIS_CACHE_PREFIX, 'report_cache', reportId].join(':')

export const reportsIndexKey = () => [REDIS_CACHE_PREFIX, 'reports_index'].join(':')
