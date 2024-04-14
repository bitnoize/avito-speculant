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

// categoryId, advertId, tgFromId, postedAt
export type AvitoReport = [number, number, string, number]

export const reportKey = (
  reportId: string
) => [REDIS_CACHE_PREFIX, 'report', reportId].join(':')

export const reportsKey = () => [REDIS_CACHE_PREFIX, 'reports'].join(':')
