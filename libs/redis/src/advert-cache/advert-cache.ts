import { REDIS_CACHE_PREFIX } from '../redis.js'

export interface AdvertCache {
  id: number
  title: string
  priceRub: number
  url: string
  age: number
  imageUrl: string
  time: number
}

export interface AvitoAdvert {
  id: number
  title: string
  priceRub: number
  url: string
  age: number
  imageUrl: string
}

export const advertKey = (advertId: number) => [REDIS_CACHE_PREFIX, 'advert', advertId].join(':')

export const scraperAdvertsKey = (scraperId: string) =>
  [REDIS_CACHE_PREFIX, 'scraper-adverts', scraperId].join(':')

export const categoryAdvertsKey = (categoryId: number, topic: string) =>
  [REDIS_CACHE_PREFIX, 'category-adverts', categoryId, topic].join(':')
