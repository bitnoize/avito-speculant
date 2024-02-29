import { Redis } from 'ioredis'
import { Logger } from '@avito-speculant/logger'
import {
  ListCategoriesCacheRequest,
  ListCategoriesCacheResponse
} from './dto/list-categories-cache.js'
import * as categoryCacheRepository from './category-cache.repository.js'
import { parseNumber, parseString } from '../redis.utils.js'

export async function listCategoriesCache(
  redis: Redis,
  request: ListCategoriesCacheRequest
): Promise<ListCategoriesCacheResponse> {
  const categoriesIndex = await categoryCacheRepository.getIndexByScraperId(redis)

  const categoriesCache = await categoryCacheRepository.getList(redis, categoriesIndex)

  return {
    message: `Cache scrapers listed`,
    statusCode: 200,
    categoriesCache,
  }
}
