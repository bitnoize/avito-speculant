import {
  FetchScraperCache,
  FetchTargetScraperLink,
  FetchScrapersCache,
  SaveScraperCache,
  SaveSuccessScraperCache,
  SaveFailedScraperCache,
  DropScraperCache
} from './dto/index.js'
import { ScraperCacheNotFoundError } from './scraper-cache.errors.js'
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
 * Fetch TargetScraperLink
 */
export const fetchTargetScraperLink: FetchTargetScraperLink = async function (redis, request) {
  return await scraperCacheRepository.fetchTargetScraperLink(redis, request.urlPath)
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
 * Save ScraperCache
 */
export const saveScraperCache: SaveScraperCache = async function (redis, request) {
  await scraperCacheRepository.saveScraperCache(redis, request.scraperId, request.urlPath)
}

/*
 * Save SuccessScraperCache
 */
export const saveSuccessScraperCache: SaveSuccessScraperCache = async function (redis, request) {
  await scraperCacheRepository.saveSuccessScraperCache(redis, request.scraperId, request.sizeBytes)
}

/*
 * Save FailedScraperCache
 */
export const saveFailedScraperCache: SaveFailedScraperCache = async function (redis, request) {
  await scraperCacheRepository.saveFailedScraperCache(redis, request.scraperId, request.sizeBytes)
}

/*
 * Drop ScraperCache
 */
export const dropScraperCache: DropScraperCache = async function (redis, request) {
  await scraperCacheRepository.dropScraperCache(redis, request.scraperId, request.urlPath)
}
