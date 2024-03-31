import { Redis } from 'ioredis'
import {
  FetchAdvertCacheRequest,
  FetchAdvertCacheResponse,
  FetchScraperAdvertsCacheRequest,
  FetchScraperAdvertsCacheResponse,
  FetchCategoryAdvertsCacheRequest,
  FetchCategoryAdvertsCacheResponse,
  SaveAdvertCacheRequest,
  DropAdvertCacheRequest
} from './dto/index.js'
import * as advertCacheRepository from './advert-cache.repository.js'

/*
 * Fetch AdvertCache
 */
export async function fetchAdvertCache(
  redis: Redis,
  request: FetchAdvertCacheRequest
): Promise<FetchAdvertCacheResponse> {
  const advertCache = await advertCacheRepository.fetchAdvertCache(redis, request.advertId)

  return { advertCache }
}

/*
 * Fetch Scraper AdvertsCache
 */
export async function fetchScraperAdvertsCache(
  redis: Redis,
  request: FetchScraperAdvertsCacheRequest
): Promise<FetchScraperAdvertsCacheResponse> {
  const advertIds = await advertCacheRepository.fetchScraperAdverts(redis, request.scraperId)
  const advertsCache = await advertCacheRepository.fetchAdvertsCache(redis, advertIds)

  return { advertsCache }
}

/*
 * Fetch Category AdvertsCache
 */
export async function fetchCategoryAdvertsCache(
  redis: Redis,
  request: FetchCategoryAdvertsCacheRequest
): Promise<FetchCategoryAdvertsCacheResponse> {
  const advertIds = await advertCacheRepository.fetchCategoryAdverts(
    redis,
    request.categoryId,
    request.topic
  )
  const advertsCache = await advertCacheRepository.fetchAdvertsCache(redis, advertIds)

  return { advertsCache }
}

/*
 * Save AdvertCache
 */
export async function saveAdvertCache(
  redis: Redis,
  request: SaveAdvertCacheRequest
): Promise<void> {
  await advertCacheRepository.saveAdvertCache(
    redis,
    request.advertId,
    request.scraperId,
    request.categoryId,
    request.title,
    request.priceRub,
    request.url,
    request.age,
    request.imageUrl,
    'wait'
  )
}

/*
 * Drop AdvertCache
 */
export async function dropAdvertCache(
  redis: Redis,
  request: DropAdvertCacheRequest
): Promise<void> {
  await advertCacheRepository.dropAdvertCache(
    redis,
    request.advertId,
    request.scraperId,
    request.categoryId
  )
}
