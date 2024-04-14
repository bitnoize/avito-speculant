import {
  FetchScraperCache,
  FetchScrapersCache,
  FetchAvitoUrlScraperCache,
  FetchCategoryScrapersCache,
  FetchAdvertScrapersCache,
  DropScraperCache,
  RenewSuccessScraperCache,
  RenewFailedScraperCache
} from './dto/index.js'
import { AvitoUrlScraperError } from './scraper-cache.errors.js'
import * as scraperCacheRepository from './scraper-cache.repository.js'

/*
 * Fetch ScraperCache
 */
export const fetchScraperCache: FetchScraperCache = async function (redis, request) {
  const scraperCache = await scraperCacheRepository.fetchScraperCache(redis, request.scraperId)

  return { scraperCache }
}

/*
 * Fetch ScrapersCache
 */
export const fetchScrapersCache: FetchScrapersCache = async function (redis) {
  const scraperIds = await scraperCacheRepository.fetchScrapers(redis)
  const scrapersCache = await scraperCacheRepository.fetchScrapersCache(redis, scraperIds)

  return { scrapersCache }
}

/*
 * Fetch AvitoUrlScraperCache
 */
export const fetchAvitoUrlScraperCache: FetchAvitoUrlScraperCache = async function (
  redis,
  request
) {
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
export const fetchCategoryScrapersCache: FetchCategoryScrapersCache = async function (
  redis,
  request
) {
  const scraperIds = await scraperCacheRepository.fetchCategoryScrapers(redis, request.categoryId)
  const scrapersCache = await scraperCacheRepository.fetchScrapersCache(redis, scraperIds)

  return { scrapersCache }
}

/*
 * Fetch AdvertScrapersCache
 */
export const fetchAdvertScrapersCache: FetchAdvertScrapersCache = async function (redis, request) {
  const scraperIds = await scraperCacheRepository.fetchAdvertScrapers(redis, request.advertId)
  const scrapersCache = await scraperCacheRepository.fetchScrapersCache(redis, scraperIds)

  return { scrapersCache }
}

/*
 * Drop ScraperCache
 */
export const dropScraperCache: DropScraperCache = async function (redis, request) {
  await scraperCacheRepository.dropScraperCache(redis, request.scraperId, request.avitoUrl)
}

/*
 * Renew SuccessScraperCache
 */
export const renewSuccessScraperCache: RenewSuccessScraperCache = async function (redis, request) {
  await scraperCacheRepository.renewSuccessScraperCache(
    redis,
    request.scraperId,
    request.proxyId,
    request.sizeBytes
  )
}

/*
 * Renew FailedScraperCache
 */
export const renewFailedScraperCache: RenewFailedScraperCache = async function (redis, request) {
  await scraperCacheRepository.renewFailedScraperCache(
    redis,
    request.scraperId,
    request.proxyId,
    request.sizeBytes
  )
}
