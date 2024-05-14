import { REDIS_CACHE_PREFIX } from '../redis.js'

export interface ReportCache {
  categoryId: number
  advertId: number
  tgFromId: string
  postedAt: number
  attempt: number
}

export type CategoryReport = [
  number, // advertId
  string, // tgFromId
  number // postedAt
]

export const REPORT_TOPICS = ['wait', 'send', 'done']
export type ReportTopic = (typeof REPORT_TOPICS)[number]

export const reportCacheKey = (categoryId: number, advertId: number) =>
  [REDIS_CACHE_PREFIX, 'report-cache', categoryId, advertId].join(':')

export const reportsIndexKey = (categoryId: number, topic: ReportTopic) =>
  [REDIS_CACHE_PREFIX, 'reports-index', categoryId, topic].join(':')
