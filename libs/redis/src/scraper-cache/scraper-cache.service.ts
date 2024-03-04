import { Redis } from 'ioredis'
import { SaveScraperCacheRequest, SaveScraperCacheResponse } from './dto/save-scraper-cache.js'
import { FetchScraperCacheRequest, FetchScraperCacheResponse } from './dto/fetch-scraper-cache.js'
import { DropScraperCacheRequest, DropScraperCacheResponse } from './dto/drop-scraper-cache.js'
import { ListScrapersCacheResponse } from './dto/list-scrapers-cache.js'
import * as scraperCacheRepository from './scraper-cache.repository.js'

export async function saveScraperCache(
  redis: Redis,
  request: SaveScraperCacheRequest
): Promise<SaveScraperCacheResponse> {
  await scraperCacheRepository.saveModel(
    redis,
    request.scraperJobId,
    request.avitoUrl,
    request.intervalSec,
    request.timeout
  )

  return {
    message: `ScraperCache successfully saved`,
    statusCode: 200
  }
}

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

export async function dropScraperCache(
  redis: Redis,
  request: DropScraperCacheRequest
): Promise<DropScraperCacheResponse> {
  await scraperCacheRepository.dropModel(redis, request.scraperJobId)

  return {
    message: `ScraperCache successfully dropped`,
    statusCode: 200
  }
}

export async function listScrapersCache(redis: Redis): Promise<ListScrapersCacheResponse> {
  const scraperIds = await scraperCacheRepository.fetchIndex(redis)
  const scrapersCache = await scraperCacheRepository.fetchCollection(redis, scraperIds)

  return {
    message: `ScrapersCache successfully listed`,
    statusCode: 200,
    scrapersCache
  }
}
