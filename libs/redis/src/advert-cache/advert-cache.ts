import { REDIS_CACHE_PREFIX } from '../redis.js'

export interface AdvertCache {
  scraperId: string
  advertId: number
  title: string
  description: string
  categoryName: string
  priceRub: number
  url: string
  age: string
  imageUrl: string
  postedAt: number
}

export type ScraperAdvert = [
  number, // advertId
  string, // title
  string, // description
  string, // categoryName
  number, // priceRub
  string, // url
  string, // age
  string, // imageUrl
  number // postedAt
]

export const advertCacheKey = (scraperId: string, advertId: number) =>
  [REDIS_CACHE_PREFIX, 'advert-cache', scraperId, advertId].join(':')

export const advertsIndexKey = (scraperId: string) =>
  [REDIS_CACHE_PREFIX, 'adverts-index', scraperId].join(':')
