import { Redis } from 'ioredis'
import {
  FetchScraperCacheRequest,
  FetchScraperCacheResponse,
  FindScraperCacheRequest,
  FindScraperCacheResponse,
  FetchScrapersCacheResponse,
  FetchCategoryScrapersCacheRequest,
  FetchCategoryScrapersCacheResponse,
  FetchAdvertScrapersCacheRequest,
  FetchAdvertScrapersCacheResponse,
  SaveScraperCacheRequest,
  DropScraperCacheRequest,
  RenewScraperCacheRequest
} from './dto/index.js'
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
 * Find ScraperCache
 */
export async function findScraperCache(
  redis: Redis,
  request: FindScraperCacheRequest
): Promise<FindScraperCacheResponse> {
  const scraperId = await scraperCacheRepository.findAvitoUrlScraper(redis, request.avitoUrl)

  if (scraperId === undefined) {
    return {
      scraperCache: undefined
    }
  }

  const scraperCache = await scraperCacheRepository.fetchScraperCache(redis, scraperId)

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

/*
 * Save ScraperCache
 */
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

/*
 * Drop ScraperCache
 */
export async function dropScraperCache(
  redis: Redis,
  request: DropScraperCacheRequest
): Promise<void> {
  await scraperCacheRepository.dropScraperCache(redis, request.scraperId, request.avitoUrl)
}

/*
 * Renew success ScraperCache
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
 * Renew failed ScraperCache
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
