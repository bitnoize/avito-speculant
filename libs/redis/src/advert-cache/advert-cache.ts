import { REDIS_CACHE_PREFIX } from '../redis.js'

export interface AdvertCache {
  id: number
  title: string
  description: string
  categoryName: string
  priceRub: number
  url: string
  age: string
  imageUrl: string
  postedAt: number
}

export type AvitoAdvert = [
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

export const CATEGORY_ADVERTS_TOPICS = ['wait', 'send', 'done']
export type CategoryAdvertTopic = (typeof CATEGORY_ADVERTS_TOPICS)[number]

export const advertCacheKey = (advertId: number) =>
  [REDIS_CACHE_PREFIX, 'advert-cache', advertId].join(':')

export const scraperAdvertsIndexKey = (scraperId: string) =>
  [REDIS_CACHE_PREFIX, 'scraper-adverts-index', scraperId].join(':')

export const categoryAdvertsIndexKey = (categoryId: number, topic: CategoryAdvertTopic) =>
  [REDIS_CACHE_PREFIX, 'category-adverts-index', categoryId, topic].join(':')
