import {
  FetchAdvertCache,
  FetchScraperAdvertsCache,
  FetchCategoryAdvertsCache,
  SaveAdvertsCache,
  DropAdvertCache,
  PourCategoryAdvertsSkip,
  PourCategoryAdvertsWait,
  PourCategoryAdvertsSend,
  PourCategoryAdvertDone
} from './dto/index.js'
import * as advertCacheRepository from './advert-cache.repository.js'

/*
 * Fetch AdvertCache
 */
export const fetchAdvertCache: FetchAdvertCache = async function (redis, request) {
  const advertCache = await advertCacheRepository.fetchAdvertCache(redis, request.advertId)

  return { advertCache }
}

/*
 * Fetch ScraperAdvertsCache
 */
export const fetchScraperAdvertsCache: FetchScraperAdvertsCache = async function (redis, request) {
  const advertIds = await advertCacheRepository.fetchScraperAdverts(redis, request.scraperId)
  const advertsCache = await advertCacheRepository.fetchAdvertsCache(redis, advertIds)

  return { advertsCache }
}

/*
 * Fetch CategoryAdvertsCache
 */
export const fetchCategoryAdvertsCache: FetchCategoryAdvertsCache = async function (
  redis,
  request
) {
  const advertIds = await advertCacheRepository.fetchCategoryAdverts(
    redis,
    request.categoryId,
    request.topic
  )
  const advertsCache = await advertCacheRepository.fetchAdvertsCache(redis, advertIds)

  return { advertsCache }
}

/*
 * Save AdvertsCache
 */
export const saveAdvertsCache: SaveAdvertsCache = async function (redis, request) {
  await advertCacheRepository.saveAdvertsCache(redis, request.scraperId, request.avitoAdverts)
}

/*
 * Drop AdvertCache
 */
export const dropAdvertCache: DropAdvertCache = async function (redis, request) {
  await advertCacheRepository.dropAdvertCache(redis, request.advertId, request.scraperId)
}

/*
 * Pour CategoryAdvertsSkip
 */
export const pourCategoryAdvertsSkip: PourCategoryAdvertsSkip = async function (redis, request) {
  await advertCacheRepository.pourCategoryAdvertsSkip(redis, request.scraperId, request.categoryId)
}

/*
 * Pour CategoryAdvertsWait
 */
export const pourCategoryAdvertsWait: PourCategoryAdvertsWait = async function (redis, request) {
  await advertCacheRepository.pourCategoryAdvertsWait(redis, request.scraperId, request.categoryId)
}

/*
 * Pour CategoryAdvertsSend
 */
export const pourCategoryAdvertsSend: PourCategoryAdvertsSend = async function (redis, request) {
  await advertCacheRepository.pourCategoryAdvertsSend(redis, request.categoryId, request.count)
}

/*
 * Pour CategoryAdvertDone
 */
export const pourCategoryAdvertDone: PourCategoryAdvertDone = async function (redis, request) {
  await advertCacheRepository.pourCategoryAdvertDone(redis, request.categoryId, request.advertId)
}
