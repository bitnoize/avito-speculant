import { Redis } from 'ioredis'
import {
  CategoryCache,
  categoryKey,
  userCategoriesKey,
  scraperCategoriesKey
} from './category-cache.js'
import {
  parseNumber,
  parseManyNumbers,
  parseString,
  parseHash,
  parsePipeline,
  parseCommand
} from '../redis.utils.js'

export async function fetchCategoryCache(redis: Redis, categoryId: number): Promise<CategoryCache> {
  const result = await redis.fetchCategoryCache(
    categoryKey(categoryId) // KEYS[1]
  )

  return parseModel(result, `CategoryCache fetchCategoryCache malformed result`)
}

export async function fetchUserCategories(redis: Redis, userId: number): Promise<number[]> {
  const result = await redis.fetchUserCategories(
    userCategoriesKey(userId) // KEYS[1]
  )

  return parseManyNumbers(result, `CategoryCache fetchUserCategories malformed result`)
}

export async function fetchScraperCategories(redis: Redis, scraperId: string): Promise<number[]> {
  const result = await redis.fetchScraperCategories(
    scraperCategoriesKey(scraperId) // KEYS[1]
  )

  return parseManyNumbers(result, `CategoryCache fetchScraperCategories malformed result`)
}

export async function fetchCategoriesCache(
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

  const result = await pipeline.exec()

  return parseCollection(result, `CategoryCache fetchCategoriesCache malformed result`)
}

export async function saveCategoryCache(
  redis: Redis,
  categoryId: number,
  userId: number,
  scraperId: string,
  avitoUrl: string
): Promise<void> {
  await redis.saveCategoryCache(
    categoryKey(categoryId), // KEYS[1]
    userCategoriesKey(userId), // KEYS[2]
    scraperCategoriesKey(scraperId), // KEYS[3]
    categoryId, // ARGV[1]
    userId, // ARGV[2]
    scraperId, // ARGV[3]
    avitoUrl, // ARGV[4]
    Date.now() // ARGV[5]
  )
}

export async function dropCategoryCache(
  redis: Redis,
  categoryId: number,
  userId: number,
  scraperId: string
): Promise<void> {
  await redis.dropCategoryCache(
    categoryKey(categoryId), // KEYS[1]
    userCategoriesKey(userId), // KEYS[2]
    scraperCategoriesKey(scraperId), // KEYS[3]
    categoryId // ARGV[1]
  )
}

const parseModel = (result: unknown, message: string): CategoryCache => {
  const hash = parseHash(result, 5, message)

  return {
    id: parseNumber(hash[0], message),
    userId: parseNumber(hash[1], message),
    scraperId: parseString(hash[2], message),
    avitoUrl: parseString(hash[3], message),
    time: parseNumber(hash[4], message)
  }
}

const parseCollection = (result: unknown, message: string): CategoryCache[] => {
  const pipeline = parsePipeline(result, message)

  return pipeline.map((pl) => {
    const command = parseCommand(pl, message)
    return parseModel(command, message)
  })
}
