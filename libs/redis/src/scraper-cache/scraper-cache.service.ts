import { Redis } from 'ioredis'
import {
  FetchScraperCacheRequest,
  FetchScraperCacheResponse,
  FetchScrapersCacheResponse,
  FetchAvitoUrlScraperCacheRequest,
  FetchAvitoUrlScraperCacheResponse,
  FetchCategoryScrapersCacheRequest,
  FetchCategoryScrapersCacheResponse,
  FetchAdvertScrapersCacheRequest,
  FetchAdvertScrapersCacheResponse,
  DropScraperCacheRequest,
  RenewScraperCacheRequest
} from './dto/index.js'
import { AvitoUrlScraperError } from './scraper-cache.errors.js'
import * as scraperCacheRepository from './scraper-cache.repository.js'

/*
 * Fetch ScraperCache
 */
export async function fetchScraperCache(
  redis: Redis,
  request: FetchScraperCacheRequest
): Promise<FetchScraperCacheResponse> {
  const scraperCache = await scraperCacheRepository.fetchScraperCache(redis, request.scraperId)

  return { scraperCache }
}

/*
 * Fetch ScrapersCache
 */
export async function fetchScrapersCache(redis: Redis): Promise<FetchScrapersCacheResponse> {
  const scraperIds = await scraperCacheRepository.fetchScrapers(redis)
  const scrapersCache = await scraperCacheRepository.fetchScrapersCache(redis, scraperIds)

  return { scrapersCache }
}

/*
 * Fetch AvitoUrl ScraperCache
 */
export async function fetchAvitoUrlScraperCache(
  redis: Redis,
  request: FetchAvitoUrlScraperCacheRequest
): Promise<FetchAvitoUrlScraperCacheResponse> {
  const scraperIds = await scraperCacheRepository.fetchAvitoUrlScrapers(redis, request.avitoUrl)

  if (scraperIds.length === 0) {
    return {
      scraperCache: undefined
    }
  }

  if (scraperIds.length !== 1) {
    throw new AvitoUrlScraperError({ request })
  }

  const scraperCache = await scraperCacheRepository.fetchScraperCache(redis, scraperIds[0])

  return { scraperCache }
}

/*
 * Fetch CategoryScrapersCache
 */
export async function fetchCategoryScrapersCache(
  redis: Redis,
  request: FetchCategoryScrapersCacheRequest
): Promise<FetchCategoryScrapersCacheResponse> {
  const scraperIds = await scraperCacheRepository.fetchCategoryScrapers(redis, request.categoryId)
  const scrapersCache = await scraperCacheRepository.fetchScrapersCache(redis, scraperIds)

  return { scrapersCache }
}

/*
 * Fetch AdvertScrapersCache
 */
export async function fetchAdvertScrapersCache(
  redis: Redis,
  request: FetchAdvertScrapersCacheRequest
): Promise<FetchAdvertScrapersCacheResponse> {
  const scraperIds = await scraperCacheRepository.fetchAdvertScrapers(redis, request.advertId)
  const scrapersCache = await scraperCacheRepository.fetchScrapersCache(redis, scraperIds)

  return { scrapersCache }
}

export async function dropScraperCache(
  redis: Redis,
  request: DropScraperCacheRequest
): Promise<void> {
  await scraperCacheRepository.dropScraperCache(redis, request.scraperId, request.avitoUrl)
}

/*
 * Renew Success ScraperCache
 */
export async function renewSuccessScraperCache(
  redis: Redis,
  request: RenewScraperCacheRequest
): Promise<void> {
  await scraperCacheRepository.renewSuccessScraperCache(
    redis,
    request.scraperId,
    request.proxyId,
    request.sizeBytes
  )
}

/*
 * Renew Failed ScraperCache
 */
export async function renewFailedScraperCache(
  redis: Redis,
  request: RenewScraperCacheRequest
): Promise<void> {
  await scraperCacheRepository.renewFailedScraperCache(
    redis,
    request.scraperId,
    request.proxyId,
    request.sizeBytes
  )
}

/*
export async function saveScraperCache(
  redis: Redis,
  request: SaveScraperCacheRequest
): Promise<void> {
  await scraperCacheRepository.saveScraperCache(
    redis,
    request.scraperId,
    request.avitoUrl,
    request.intervalSec
  )
}
*/
