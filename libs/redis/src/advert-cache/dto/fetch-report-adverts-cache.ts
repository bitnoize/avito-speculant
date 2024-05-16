import { AdvertCache } from '../advert-cache.js'
import { ReportTopic } from '../../report-cache/report-cache.js'
import { RedisMethod } from '../../redis.js'

export type FetchReportAdvertsCacheRequest = {
  scraperId: string
  categoryId: number
  topic: ReportTopic
}

export type FetchReportAdvertsCacheResponse = {
  advertsCache: AdvertCache[]
}

export type FetchReportAdvertsCache = RedisMethod<
  FetchReportAdvertsCacheRequest,
  FetchReportAdvertsCacheResponse
>
