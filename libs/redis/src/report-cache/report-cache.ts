import { REDIS_CACHE_PREFIX } from '../redis.js'

export interface ReportCache {
  categoryId: number
  advertId: number
  tgFromId: string
  postedAt: number
  attempt: number
}

export type AvitoReport = [
  number, // categoryId
  number, // advertId
  string, // tgFromId
  number // postedAt
]

export const reportCacheKey = (categoryId: number, advertId: number) =>
  [REDIS_CACHE_PREFIX, 'report-cache', categoryId, advertId].join(':')

export const reportsIndexKey = (categoryId: number) =>
  [REDIS_CACHE_PREFIX, 'reports-index', categoryId].join(':')
