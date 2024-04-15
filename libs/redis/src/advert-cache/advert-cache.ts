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
  time: number
}

export type AvitoAdvert = [
  number, // id
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

export const advertKey = (advertId: number) => [REDIS_CACHE_PREFIX, 'advert', advertId].join(':')

export const scraperAdvertsKey = (scraperId: string) =>
  [REDIS_CACHE_PREFIX, 'scraper-adverts', scraperId].join(':')

export const categoryAdvertsKey = (categoryId: number, topic: CategoryAdvertTopic) =>
  [REDIS_CACHE_PREFIX, 'category-adverts', categoryId, topic].join(':')
