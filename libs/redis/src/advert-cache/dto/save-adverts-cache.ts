import { AvitoAdvert } from '../advert-cache.js'
import { RedisMethod } from '../../redis.js'

export type SaveAdvertsCacheRequest = {
  scraperId: string
  avitoAdverts: AvitoAdvert[]
}

export type SaveAdvertsCacheResponse = void

export type SaveAdvertsCache = RedisMethod<SaveAdvertsCacheRequest, SaveAdvertsCacheResponse>
