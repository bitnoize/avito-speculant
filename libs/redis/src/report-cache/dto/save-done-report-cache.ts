import { RedisMethod } from '../../redis.js'

export type SaveDoneReportCacheRequest = {
  categoryId: number
  advertId: number
  postedAt: number
}

export type SaveDoneReportCacheResponse = void

export type SaveDoneReportCache = RedisMethod<
  SaveDoneReportCacheRequest,
  SaveDoneReportCacheResponse
>
