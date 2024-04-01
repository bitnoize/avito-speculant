import { Redis } from 'ioredis'
import {
  FetchAdvertCacheRequest,
  FetchAdvertCacheResponse,
  FetchScraperAdvertsCacheRequest,
  FetchScraperAdvertsCacheResponse,
  SaveAdvertsCacheRequest,
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
 * Save AdvertsCache
 */
export async function saveAdvertsCache(
  redis: Redis,
  request: SaveAdvertsCacheRequest
): Promise<void> {
  await advertCacheRepository.saveAdvertsCache(
    redis,
    request.scraperId,
    request.avitoAdverts
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
  )
}
