import { ScraperAdvert } from '../advert-cache.js'
import { RedisMethod } from '../../redis.js'

export type SaveAdvertsCacheRequest = {
  scraperId: string
  scraperAdverts: ScraperAdvert[]
}

export type SaveAdvertsCacheResponse = void

export type SaveAdvertsCache = RedisMethod<SaveAdvertsCacheRequest, SaveAdvertsCacheResponse>
