import { Redis } from 'ioredis'
import {
  CategoryCache,
  categoryCacheKey,
  userCategoriesIndexKey,
  scraperCategoriesIndexKey
} from './category-cache.js'
import {
  parseNumber,
  parseNumberOrNull,
  parseManyNumbers,
  parseString,
  parseHash,
  parsePipeline,
  parseCommand
} from '../redis.utils.js'

export async function fetchCategoryCache(
  redis: Redis,
  categoryId: number
): Promise<CategoryCache | undefined> {
  const result = await redis.fetchCategoryCache(
    categoryCacheKey(categoryId) // KEYS[1]
  )

  return parseModel(result, `fetchCategoryCache malformed result`)
}

export async function fetchUserCategoriesIndex(redis: Redis, userId: number): Promise<number[]> {
  const result = await redis.fetchCategoriesIndex(
    userCategoriesIndexKey(userId) // KEYS[1]
  )

  return parseManyNumbers(result, `fetchUserCategoriesIndex malformed result`)
}

export async function fetchScraperCategoriesIndex(
  redis: Redis,
  scraperId: string
): Promise<number[]> {
  const result = await redis.fetchCategoriesIndex(
    scraperCategoriesIndexKey(scraperId) // KEYS[1]
  )

  return parseManyNumbers(result, `fetchScraperCategoriesIndex malformed result`)
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
      categoryCacheKey(categoryId) // KEYS[1]
    )
  })

  const result = await pipeline.exec()

  return parseCollection(result, `fetchCategoriesCache malformed result`)
}

export async function saveCategoryCache(
  redis: Redis,
  categoryId: number,
  userId: number,
  urlPath: string,
  botId: number | null,
  scraperId: string,
  isEnabled: boolean,
  createdAt: number,
  updatedAt: number,
  queuedAt: number
): Promise<void> {
  const multi = redis.multi()

  multi.saveCategoryCache(
    categoryCacheKey(categoryId), // KEYS[1]
    categoryId, // ARGV[1]
    userId, // ARGV[2]
    urlPath, // ARGV[3]
    botId, // ARGV[4]
    scraperId, // ARGV[5]
    isEnabled ? 1 : 0, // ARGV[6]
    createdAt, // ARGV[7]
    updatedAt, // ARGV[8]
    queuedAt // ARGV[9]
  )

  multi.saveCategoriesIndex(
    userCategoriesIndexKey(userId), // KEYS[1]
    categoryId, // ARGV[1]
    createdAt // ARGV[2]
  )

  if (isEnabled) {
    multi.saveCategoriesIndex(
      scraperCategoriesIndexKey(scraperId), // KEYS[1]
      categoryId, // ARGV[1]
      createdAt // ARGV[2]
    )
  } else {
    multi.dropCategoriesIndex(
      scraperCategoriesIndexKey(scraperId), // KEYS[1]
      categoryId // ARGV[1]
    )
  }

  await multi.exec()
}

export async function saveProvisoCategoryCache(
  redis: Redis,
  categoryId: number,
  reportedAt: number
): Promise<void> {
  const multi = redis.multi()

  multi.saveProvisoCategoryCache(
    categoryCacheKey(categoryId), // KEYS[1]
    reportedAt // ARGV[1]
  )

  await multi.exec()
}

export async function dropCategoryCache(
  redis: Redis,
  categoryId: number,
  userId: number,
  scraperId: string
): Promise<void> {
  const multi = redis.multi()

  multi.dropCategoryCache(
    categoryCacheKey(categoryId) // KEYS[1]
  )

  multi.dropCategoriesIndex(
    userCategoriesIndexKey(userId), // KEYS[1]
    categoryId // ARGV[1]
  )

  multi.dropCategoriesIndex(
    scraperCategoriesIndexKey(scraperId), // KEYS[1]
    categoryId // ARGV[1]
  )

  await multi.exec()
}

const parseModel = (result: unknown, message: string): CategoryCache | undefined => {
  if (result === null) {
    return undefined
  }

  const hash = parseHash(result, 10, message)

  return {
    id: parseNumber(hash[0], message),
    userId: parseNumber(hash[1], message),
    urlPath: parseString(hash[2], message),
    botId: parseNumberOrNull(hash[3], message),
    scraperId: parseString(hash[4], message),
    isEnabled: !!parseNumber(hash[5], message),
    createdAt: parseNumber(hash[6], message),
    updatedAt: parseNumber(hash[7], message),
    queuedAt: parseNumber(hash[8], message),
    reportedAt: parseNumber(hash[9], message)
  }
}

const parseCollection = (result: unknown, message: string): CategoryCache[] => {
  const collection: CategoryCache[] = []

  const pipeline = parsePipeline(result, message)

  pipeline.forEach((pl) => {
    const command = parseCommand(pl, message)
    const model = parseModel(command, message)

    if (model !== undefined) {
      collection.push(model)
    }
  })

  return collection
}
