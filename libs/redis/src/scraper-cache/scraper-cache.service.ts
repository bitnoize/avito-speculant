import { Redis } from 'ioredis'
import {
  FetchScraperCacheRequest,
  FetchScraperCacheResponse,
  FindScraperCacheRequest,
  FindScraperCacheResponse,
  ListScrapersCacheResponse,
  SaveScraperCacheRequest,
  SaveScraperCacheResponse,
  DropScraperCacheRequest,
  DropScraperCacheResponse
} from './dto/index.js'
import * as scraperCacheRepository from './scraper-cache.repository.js'

/*
 * Fetch ScraperCache
 */
export async function fetchScraperCache(
  redis: Redis,
  request: FetchScraperCacheRequest
): Promise<FetchScraperCacheResponse> {
  const scraperCache = await scraperCacheRepository.fetchModel(redis, request.scraperJobId)

  return {
    message: `ScraperCache successfully fetched`,
    statusCode: 200,
    scraperCache
  }
}

/*
 * Find ScraperCache
 */
export async function findScraperCache(
  redis: Redis,
  request: FindScraperCacheRequest
): Promise<FindScraperCacheResponse> {
  const scraperJobId = await scraperCacheRepository.findAvitoUrlIndex(redis, request.avitoUrl)

  if (scraperJobId === undefined) {
    return {
      message: `ScraperCache not found`,
      statusCode: 404
    }
  }

  const scraperCache = await scraperCacheRepository.fetchModel(redis, scraperJobId)

  return {
    message: `ScraperCache successfully found`,
    statusCode: 200,
    scraperCache
  }
}

/*
 * List ScraperCache
 */
export async function listScrapersCache(redis: Redis): Promise<ListScrapersCacheResponse> {
  const scraperJobIds = await scraperCacheRepository.fetchIndex(redis)
  const scrapersCache = await scraperCacheRepository.fetchCollection(redis, scraperJobIds)

  return {
    message: `ScrapersCache successfully listed`,
    statusCode: scrapersCache.length > 0 ? 200 : 204,
    scrapersCache
  }
}

/*
 * Save ScraperCache
 */
export async function saveScraperCache(
  redis: Redis,
  request: SaveScraperCacheRequest
): Promise<SaveScraperCacheResponse> {
  await scraperCacheRepository.saveModel(
    redis,
    request.scraperJobId,
    request.avitoUrl,
    request.intervalSec
  )

  return {
    message: `ScraperCache successfully saved`,
    statusCode: 200
  }
}

/*
 * Drop ScraperCache
 */
export async function dropScraperCache(
  redis: Redis,
  request: DropScraperCacheRequest
): Promise<DropScraperCacheResponse> {
  await scraperCacheRepository.dropModel(redis, request.scraperJobId, request.avitoUrl)

  return {
    message: `ScraperCache successfully dropped`,
    statusCode: 200
  }
}
