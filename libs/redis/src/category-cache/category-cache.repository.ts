import { Redis } from 'ioredis'
import {
  CategoryCache,
  categoryCacheKey,
  userCategoriesCacheKey,
  scraperCategoriesCacheKey
} from './category-cache.js'
import {
  parseNumber,
  parseManyNumbers,
  parseString,
  parseHash,
  parsePipeline,
  parseCommand
} from '../redis.utils.js'

export const fetchCategoryCacheLua = `
if redis.call('EXISTS', KEYS[1]) == 0 then
  return nil 
end

local category_cache = redis.call(
  'HMGET', KEYS[1],
  'id',
  'user_id',
  'scraper_id',
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

  return parseModel(result, `CategoryCache fetchModel malformed result`)
}

export const fetchUserCategoriesCacheIndexLua = `
return redis.call('SMEMBERS', KEYS[1])
`

export async function fetchUserIndex(redis: Redis, userId: number): Promise<number[]> {
  const result = await redis.fetchUserCategoriesCacheIndex(
    userCategoriesCacheKey(userId) // KEYS[1]
  )

  return parseManyNumbers(result, `CategoryCache fetchPlanIndex malformed result`)
}

export const fetchScraperCategoriesCacheIndexLua = `
return redis.call('SMEMBERS', KEYS[1])
`

export async function fetchScraperIndex(redis: Redis, scraperId: string): Promise<number[]> {
  const result = await redis.fetchScraperCategoriesCacheIndex(
    scraperCategoriesCacheKey(scraperId) // KEYS[1]
  )

  return parseManyNumbers(result, `CategoryCache fetchScraperIndex malformed result`)
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

  const result = await pipeline.exec()

  return parseCollection(result, `CategoryCache fetchCollection malformed result`)
}

export const saveCategoryCacheLua = `
redis.call(
  'HSET', KEYS[1],
  'id', ARGV[1],
  'user_id', ARGV[2],
  'scraper_id', ARGV[3],
  'avito_url', ARGV[4]
)

redis.call('SADD', KEYS[2], ARGV[1])

redis.call('SADD', KEYS[3], ARGV[1])

return redis.status_reply('OK')
`

export async function saveModel(
  redis: Redis,
  categoryId: number,
  userId: number,
  scraperId: string,
  avitoUrl: string
): Promise<void> {
  await redis.saveCategoryCache(
    categoryCacheKey(categoryId), // KEYS[1]
    userCategoriesCacheKey(userId), // KEYS[2]
    scraperCategoriesCacheKey(scraperId), // KEYS[3]
    categoryId, // ARGV[1]
    userId, // ARGV[2]
    scraperId, // ARGV[3]
    avitoUrl, // ARGV[4]
  )
}

export const dropCategoryCacheLua = `
redis.call('DEL', KEYS[1])

redis.call('SREM', KEYS[2], ARGV[1])

redis.call('SREM', KEYS[3], ARGV[1])

return redis.status_reply('OK')
`

export async function dropModel(
  redis: Redis,
  categoryId: number,
  userId: number,
  scraperId: string
): Promise<void> {
  await redis.dropCategoryCache(
    categoryCacheKey(categoryId), // KEYS[1]
    userCategoriesCacheKey(userId), // KEYS[2]
    scraperCategoriesCacheKey(scraperId), // KEYS[3]
    categoryId, // ARGV[1]
  )
}

const parseModel = (result: unknown, message: string): CategoryCache => {
  const hash = parseHash(result, 4, message)

  return {
    id: parseNumber(hash[0], message),
    userId: parseNumber(hash[1], message),
    scraperId: parseString(hash[2], message),
    avitoUrl: parseString(hash[3], message)
  }
}

const parseCollection = (result: unknown, message: string): CategoryCache[] => {
  const pipeline = parsePipeline(result, message)

  return pipeline.map((pl) => {
    const command = parseCommand(pl, message)
    return parseModel(command, message)
  })
}
