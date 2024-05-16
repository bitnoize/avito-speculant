import { REDIS_CACHE_PREFIX } from '../redis.js'

export interface ReportCache {
  scraperId: string
  categoryId: number
  advertId: number
  tgFromId: string
  token: string
  postedAt: number
  attempt: number
}

export type CategoryReport = [
  number, // advertId
  number // postedAt
]

export const REPORT_TOPICS = ['wait', 'send', 'done']
export type ReportTopic = (typeof REPORT_TOPICS)[number]

export const reportCacheKey = (categoryId: number, advertId: number) =>
  [REDIS_CACHE_PREFIX, 'report-cache', categoryId, advertId].join(':')

export const reportsIndexKey = (categoryId: number, topic: ReportTopic) =>
  [REDIS_CACHE_PREFIX, 'reports-index', categoryId, topic].join(':')
