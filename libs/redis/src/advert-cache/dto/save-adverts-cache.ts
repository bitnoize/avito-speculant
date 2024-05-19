import { ScraperAdvert } from '../advert-cache.js'
import { RedisMethod } from '../../redis.js'

export type SaveAdvertsCacheRequest = {
  scraperId: string
  scraperAdverts: ScraperAdvert[]
}

export type SaveAdvertsCache = RedisMethod<SaveAdvertsCacheRequest, void>
