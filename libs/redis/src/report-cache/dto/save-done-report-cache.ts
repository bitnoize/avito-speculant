import { RedisMethod } from '../../redis.js'

export type SaveDoneReportCacheRequest = {
  categoryId: number
  advertId: number
  postedAt: number
}

export type SaveDoneReportCache = RedisMethod<SaveDoneReportCacheRequest, void>
