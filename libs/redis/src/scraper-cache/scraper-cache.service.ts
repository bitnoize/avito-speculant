import { Redis } from 'ioredis'
import {
  FetchScraperCacheRequest,
  FetchScraperCacheResponse,
  FindScraperCacheRequest,
  FindScraperCacheResponse,
  FetchScrapersCacheResponse,
  SaveScraperCacheRequest,
  DropScraperCacheRequest
} from './dto/index.js'
import * as scraperCacheRepository from './scraper-cache.repository.js'

/*
 * Fetch ScraperCache
 */
export async function fetchScraperCache(
  redis: Redis,
  request: FetchScraperCacheRequest
): Promise<FetchScraperCacheResponse> {
  const scraperCache = await scraperCacheRepository.fetchModel(redis, request.scraperId)

  return { scraperCache }
}

/*
 * Find ScraperCache
 */
export async function findScraperCache(
  redis: Redis,
  request: FindScraperCacheRequest
): Promise<FindScraperCacheResponse> {
  const scraperId = await scraperCacheRepository.findAvitoUrlIndex(redis, request.avitoUrl)

  if (scraperId === undefined) {
    return {}
  }

  const scraperCache = await scraperCacheRepository.fetchModel(redis, scraperId)

  return { scraperCache }
}

/*
 * Fetch ScraperCache
 */
export async function fetchScrapersCache(redis: Redis): Promise<FetchScrapersCacheResponse> {
  const scraperIds = await scraperCacheRepository.fetchIndex(redis)
  const scrapersCache = await scraperCacheRepository.fetchCollection(redis, scraperIds)

  return { scrapersCache }
}

/*
 * Save ScraperCache
 */
export async function saveScraperCache(
  redis: Redis,
  request: SaveScraperCacheRequest
): Promise<void> {
  await scraperCacheRepository.saveModel(
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
  await scraperCacheRepository.dropModel(redis, request.scraperId, request.avitoUrl)
}
