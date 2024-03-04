import { Redis } from 'ioredis'
import { CategoryCache } from './category-cache.js'
import { parseNumber, parseManyNumbers, parseString } from '../redis.utils.js'
import { REDIS_CACHE_PREFIX } from '../redis.js'

const categoryKey = (categoryId: number) => [REDIS_CACHE_PREFIX, 'category', categoryId].join(':')

const userCategoriesKey = (userId: number) =>
  [REDIS_CACHE_PREFIX, 'user-categories', userId].join(':')

const scraperCategoriesKey = (scraperJobId: string) =>
  [REDIS_CACHE_PREFIX, 'scraper-categories', scraperJobId].join(':')

export const saveCategoryCacheLua = `
redis.call(
  'HSET', KEYS[1],
  'id', ARGV[1],
  'user_id', ARGV[2],
  'avito_url', ARGV[3],
)
redis.call('PEXPIRE', KEYS[1], ARGV[4])

redis.call('SADD', KEYS[2], ARGV[1])
redis.call('PEXPIRE', KEYS[3], ARGV[4])

return redis.status_reply('OK')
`

export async function saveModel(
  redis: Redis,
  categoryId: number,
  userId: number,
  avitoUrl: string,
  timeout: number
): Promise<void> {
  await redis.saveCategoryCache(
    categoryKey(categoryId), // KEYS[1]
    userCategoriesKey(userId), // KEYS[2]
    categoryId, // ARGV[1]
    userId, // ARGV[2]
    avitoUrl, // ARGV[3]
    timeout // ARGV[4]
  )
}

export const fetchCategoryCacheLua = `
if redis.call('EXISTS', KEYS[1]) == 0 then
  return redis.error_reply('ERR message ' .. KEYS[1] .. ' lost')
end

local category_cache = redis.call(
  'HMGET', KEYS[1],
  'id',
  'user_id',
  'avito_url'
)

return {
  unpack(category_cache)
}
`

export async function fetchModel(redis: Redis, categoryId: number): Promise<CategoryCache> {
  const result = await redis.fetchCategoryCache(
    categoryKey(categoryId) // KEYS[1]
  )

  return parseModel(result)
}

export const dropCategoryCacheLua = `
redis.call('DEL', KEYS[1])
redis.call('SREM', KEYS[2], ARGV[1])
`

export async function dropModel(redis: Redis, categoryId: number, userId: number): Promise<void> {
  await redis.dropCategoryCache(
    categoryKey(categoryId), // KEYS[1]
    userCategoriesKey(userId), // KEYS[2]
    categoryId // ARGV[1]
  )
}

export const fetchUserCategoriesCacheIndexLua = `
return redis.call('SMEMBERS', KEYS[1])
`

export async function fetchUserIndex(redis: Redis, userId: number): Promise<number[]> {
  const results = await redis.fetchUserCategoriesCacheIndex(
    userCategoriesKey(userId) // KEYS[1]
  )

  return parseManyNumbers(results)
}

export const attachScraperCategoryCacheIndexLua = `
redis.call('SADD', KEYS[1], ARGV[1])
redis.call('PEXPIRE', KEYS[2], ARGV[2])

return redis.status_reply('OK')
`

export async function attachScraper(
  redis: Redis,
  categoryId: number,
  scraperJobId: string,
  timeout: number
): Promise<void> {
  await redis.attachScraperCategoryCache(
    scraperCategoriesKey(scraperJobId), // KEYS[1]
    categoryId, // ARGV[1]
    timeout // ARGV[2]
  )
}

export const detachScraperCategoryCacheIndexLua = `
redis.call('SREM', KEYS[1], ARGV[1])
redis.call('PEXPIRE', KEYS[2], ARGV[2])

return redis.status_reply('OK')
`

export async function detachScraper(
  redis: Redis,
  categoryId: number,
  scraperJobId: string,
  timeout: number
): Promise<void> {
  await redis.detachScraperCategoryCache(
    scraperCategoriesKey(scraperJobId), // KEYS[1]
    categoryId, // ARGV[1]
    timeout // ARGV[2]
  )
}

export const fetchScraperCategoriesCacheIndexLua = `
return redis.call('SMEMBERS', KEYS[1])
`

export async function fetchScraperIndex(redis: Redis, scraperJobId: string): Promise<number[]> {
  const results = await redis.fetchScraperCategoriesCacheIndex(
    scraperCategoriesKey(scraperJobId) // KEYS[1]
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
      categoryKey(categoryId) // KEYS[1]
    )
  })

  const results = await pipeline.exec()

  return parseCollection(results)
}

const parseModel = (result: unknown): CategoryCache => {
  if (!(Array.isArray(result) && result.length === 3)) {
    throw new TypeError(`Redis malformed result`)
  }

  return {
    id: parseNumber(result[0]),
    userId: parseNumber(result[1]),
    avitoUrl: parseString(result[2])
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
