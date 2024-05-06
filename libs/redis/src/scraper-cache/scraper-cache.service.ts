import {
  FetchScraperCache,
  FetchScrapersCache,
  FetchUrlPathScraperCache,
  FetchCategoryScrapersCache,
  FetchAdvertScrapersCache,
  DropScraperCache,
  SaveSuccessScraperCache,
  SaveFailedScraperCache
} from './dto/index.js'
import { UrlPathScraperError } from './scraper-cache.errors.js'
import * as scraperCacheRepository from './scraper-cache.repository.js'

/*
 * Fetch ScraperCache
 */
export const fetchScraperCache: FetchScraperCache = async function (redis, request) {
  const scraperCache = await scraperCacheRepository.fetchScraperCache(redis, request.scraperId)

  if (scraperCache === undefined) {
    throw new ScraperCacheNotFoundError({ request })
  }

  return { scraperCache }
}

/*
 * Fetch UrlPathScraperId
 */
export const fetchUrlPathScraperId: FetchUrlPathScraperId = async function (redis, request) {
  return await scraperCacheRepository.fetchUrlPathScraperId(redis, request.urlPath)
}

/*
 * Fetch ScrapersCache
 */
export const fetchScrapersCache: FetchScrapersCache = async function (redis) {
  const scraperIds = await scraperCacheRepository.fetchScrapersIndex(redis)
  const scrapersCache = await scraperCacheRepository.fetchScrapersCache(redis, scraperIds)

  return { scrapersCache }
}

/*
 * Fetch AdvertScrapersCache
 */
export const fetchAdvertScrapersCache: FetchAdvertScrapersCache = async function (redis, request) {
  const scraperIds = await scraperCacheRepository.fetchAdvertScrapersIndex(redis, request.advertId)
  const scrapersCache = await scraperCacheRepository.fetchScrapersCache(redis, scraperIds)

  return { scrapersCache }
}

/*
 * Save SuccessScraperCache
 */
export const saveSuccessScraperCache: SaveSuccessScraperCache = async function (redis, request) {
  await scraperCacheRepository.saveSuccessScraperCache(
    redis,
    request.scraperId,
    request.proxyId,
    request.sizeBytes
  )
}

/*
 * Save FailedScraperCache
 */
export const saveFailedScraperCache: SaveFailedScraperCache = async function (redis, request) {
  await scraperCacheRepository.saveFailedScraperCache(
    redis,
    request.scraperId,
    request.proxyId,
    request.sizeBytes
  )
}
