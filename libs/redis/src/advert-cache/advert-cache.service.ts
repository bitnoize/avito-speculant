import {
  FetchAdvertCache,
  FetchAdvertsCache,
  SaveAdvertsCache,
  DropAdvertsCache
} from './dto/index.js'
import { AdvertCacheNotFoundError } from './advert-cache.errors.js'
import * as advertCacheRepository from './advert-cache.repository.js'

/*
 * Fetch AdvertCache
 */
export const fetchAdvertCache: FetchAdvertCache = async function (redis, request) {
  const advertCache = await advertCacheRepository.fetchAdvertCache(
    redis,
    request.scraperId,
    request.advertId
  )

  if (advertCache === undefined) {
    throw new AdvertCacheNotFoundError({ request })
  }

  return { advertCache }
}

/*
 * Fetch AdvertsCache
 */
export const fetchAdvertsCache: FetchAdvertsCache = async function (redis, request) {
  const advertIds = await advertCacheRepository.fetchAdvertsIndex(redis, request.scraperId)
  const advertsCache = await advertCacheRepository.fetchAdvertsCache(
    redis,
    request.scraperId,
    advertIds
  )

  return { advertsCache }
}

/*
 * Save AdvertsCache
 */
export const saveAdvertsCache: SaveAdvertsCache = async function (redis, request) {
  await advertCacheRepository.saveAdvertsCache(redis, request.scraperId, request.scraperAdverts)
}

/*
 * Drop AdvertsCache
 */
export const dropAdvertsCache: DropAdvertsCache = async function (redis, request) {
  await advertCacheRepository.dropAdvertCache(redis, request.scraperId, request.advertIds)
}
