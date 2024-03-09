import { Redis } from 'ioredis'
import {
  CategoryCache,
  categoryCacheKey,
  userCategoriesCacheKey,
  scraperCategoriesCacheKey
} from './category-cache.js'
import { REDIS_CACHE_TIMEOUT } from '../redis.js'
import { parseNumber, parseManyNumbers, parseString } from '../redis.utils.js'

export const fetchCategoryCacheLua = `
if redis.call('EXISTS', KEYS[1]) == 0 then
  return redis.error_reply('ERR message ' .. KEYS[1] .. ' lost')
end

local category_cache = redis.call(
  'HMGET', KEYS[1],
  'id',
  'user_id',
  'scraper_job_id',
  'avito_url'
)

return {
  unpack(category_cache)
}
`

export async function fetchModel(redis: Redis, categoryId: number): Promise<CategoryCache> {
  const result = await redis.fetchCategoryCache(
    categoryCacheKey(categoryId) // KEYS[1]
  )

  return parseModel(result)
}

export const fetchUserCategoriesCacheIndexLua = `
return redis.call('SMEMBERS', KEYS[1])
`

export async function fetchUserIndex(redis: Redis, userId: number): Promise<number[]> {
  const results = await redis.fetchUserCategoriesCacheIndex(
    userCategoriesCacheKey(userId) // KEYS[1]
  )

  return parseManyNumbers(results)
}

export const fetchScraperCategoriesCacheIndexLua = `
return redis.call('SMEMBERS', KEYS[1])
`

export async function fetchScraperIndex(redis: Redis, scraperJobId: string): Promise<number[]> {
  const results = await redis.fetchScraperCategoriesCacheIndex(
    scraperCategoriesCacheKey(scraperJobId) // KEYS[1]
  )

  return parseManyNumbers(results)
}

export async function fetchCollection(
  redis: Redis,
  categoryIds: number[]
): Promise<CategoryCache[]> {
  if (categoryIds.length === 0) {
    return []
  }

  const pipeline = redis.pipeline()

  categoryIds.forEach((categoryId) => {
    pipeline.fetchCategoryCache(
      categoryCacheKey(categoryId) // KEYS[1]
    )
  })

  const results = await pipeline.exec()

  return parseCollection(results)
}

export const saveCategoryCacheLua = `
redis.call(
  'HSET', KEYS[1],
  'id', ARGV[1],
  'user_id', ARGV[2],
  'scraper_job_id', ARGV[3],
  'avito_url', ARGV[4]
)
redis.call('PEXPIRE', KEYS[1], ARGV[5])

redis.call('SADD', KEYS[2], ARGV[1])
redis.call('PEXPIRE', KEYS[2], ARGV[5])

redis.call('SADD', KEYS[3], ARGV[1])
redis.call('PEXPIRE', KEYS[3], ARGV[5])

return redis.status_reply('OK')
`

export async function saveModel(
  redis: Redis,
  categoryId: number,
  userId: number,
  scraperJobId: string,
  avitoUrl: string
): Promise<void> {
  await redis.saveCategoryCache(
    categoryCacheKey(categoryId), // KEYS[1]
    userCategoriesCacheKey(userId), // KEYS[2]
    scraperCategoriesCacheKey(scraperJobId), // KEYS[3]
    categoryId, // ARGV[1]
    userId, // ARGV[2]
    scraperJobId, // ARGV[3]
    avitoUrl, // ARGV[4]
    REDIS_CACHE_TIMEOUT // ARGV[5]
  )
}

export const dropCategoryCacheLua = `
redis.call('DEL', KEYS[1])

redis.call('SREM', KEYS[2], ARGV[1])
redis.call('PEXPIRE', KEYS[2], ARGV[2])

redis.call('SREM', KEYS[3], ARGV[1])
redis.call('PEXPIRE', KEYS[3], ARGV[2])

return redis.status_reply('OK')
`

export async function dropModel(
  redis: Redis,
  categoryId: number,
  userId: number,
  scraperJobId: string
): Promise<void> {
  await redis.dropCategoryCache(
    categoryCacheKey(categoryId), // KEYS[1]
    userCategoriesCacheKey(userId), // KEYS[2]
    scraperCategoriesCacheKey(scraperJobId), // KEYS[3]
    categoryId, // ARGV[1]
    REDIS_CACHE_TIMEOUT // ARGV[2]
  )
}

const parseModel = (result: unknown): CategoryCache => {
  if (!(Array.isArray(result) && result.length === 3)) {
    throw new TypeError(`Redis malformed result`)
  }

  return {
    id: parseNumber(result[0]),
    userId: parseNumber(result[1]),
    scraperJobId: parseString(result[2]),
    avitoUrl: parseString(result[3])
  }
}

const parseCollection = (results: unknown): CategoryCache[] => {
  if (!Array.isArray(results)) {
    throw new TypeError(`Redis malformed results`)
  }

  return results.map((result) => {
    if (!Array.isArray(result)) {
      throw new TypeError(`Redis malformed result`)
    }

    return parseModel(result[1])
  })
}
