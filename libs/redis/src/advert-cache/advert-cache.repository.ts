import { Redis } from 'ioredis'
import {
  AdvertCache,
  AvitoAdvert,
  CategoryAdvertTopic,
  advertCacheKey,
  scraperAdvertsIndexKey,
  categoryAdvertsIndexKey
} from './advert-cache.js'
import {
  parseNumber,
  parseString,
  parseManyNumbers,
  parseHash,
  parsePipeline,
  parseCommand
} from '../redis.utils.js'
import { categoryKey } from '../category-cache/category-cache.js'

export async function fetchAdvertCache(
  redis: Redis,
  advertId: number
): Promise<AdvertCache | undefined> {
  const result = await redis.fetchAdvertCache(
    advertCacheKey(advertId) // KEYS[1]
  )

  return parseModel(result, `fetchAdvertCache malformed result`)
}

export async function fetchScraperAdvertsIndex(
  redis: Redis,
  scraperId: string
): Promise<number[]> {
  const result = await redis.fetchAdvertsIndex(
    scraperAdvertsIndexKey(scraperId) // KEYS[1]
  )

  return parseManyNumbers(result, `fetchScraperAdvertsIndex malformed result`)
}

export async function fetchCategoryAdvertsIndex(
  redis: Redis,
  categoryId: number,
  topic: CategoryAdvertTopic
): Promise<number[]> {
  const result = await redis.fetchAdvertsIndex(
    categoryAdvertsIndexKey(categoryId, topic) // KEYS[1]
  )

  return parseManyNumbers(result, `fetchCategoryAdvertsIndex malformed result`)
}

export async function fetchAdvertsCache(redis: Redis, advertIds: number[]): Promise<AdvertCache[]> {
  if (advertIds.length === 0) {
    return []
  }

  const pipeline = redis.pipeline()

  advertIds.forEach((advertId) => {
    pipeline.fetchAdvertCache(
      advertCacheKey(advertId) // KEYS[1]
    )
  })

  const result = await pipeline.exec()

  return parseCollection(result, `fetchAdvertsCache malformed result`)
}

export async function saveAdvertsCache(
  redis: Redis,
  scraperId: string,
  avitoAdverts: AvitoAdvert[]
): Promise<void> {
  if (avitoAdverts.length === 0) {
    return
  }

  const pipeline = redis.pipeline()

  avitoAdverts.forEach((avitoAdvert) => {
    const advertId = avitoAdvert[0]
    pipeline.saveAdvertCache(
      advertKey(advertId), // KEYS[1]
      ...avitoAdvert, // ARGV[1..9]
    )

    pipeline.saveAdvertsIndex(
      scraperAdvertsIndexKey(scraperId), // KEYS[1]
      scraperId
    )
  })

  await pipeline.exec()
}

export async function dropAdvertCache(
  redis: Redis,
  advertId: number,
  scraperId: string
): Promise<void> {
  await redis.dropAdvertCache(
    advertKey(advertId), // KEYS[1]
    scraperAdvertsKey(scraperId), // KEYS[2]
    advertId // ARGV[1]
  )
}

export async function pourCategoryAdvertsSkip(
  redis: Redis,
  scraperId: string,
  categoryId: number
): Promise<void> {
  const multi = redis.multi()

  multi.pourCategoryAdvertsSkip(
    scraperAdvertsKey(scraperId), // KEYS[1]
    categoryAdvertsKey(categoryId, 'wait'), // KEYS[2]
    categoryAdvertsKey(categoryId, 'send'), // KEYS[3]
    categoryAdvertsKey(categoryId, 'done') // KEYS[4]
  )

  multi.resetCategoryCache(
    categoryKey(categoryId), // KEYS[1]
    Date.now() // ARGV[1]
  )

  await multi.exec()
}

export async function pourCategoryAdvertsWait(
  redis: Redis,
  scraperId: string,
  categoryId: number
): Promise<void> {
  await redis.pourCategoryAdvertsWait(
    scraperAdvertsKey(scraperId), // KEYS[1]
    categoryAdvertsKey(categoryId, 'wait'), // KEYS[2]
    categoryAdvertsKey(categoryId, 'send'), // KEYS[3]
    categoryAdvertsKey(categoryId, 'done') // KEYS[4]
  )
}

export async function pourCategoryAdvertsSend(
  redis: Redis,
  categoryId: number,
  count: number
): Promise<void> {
  await redis.pourCategoryAdvertsSend(
    categoryAdvertsKey(categoryId, 'wait'), // KEYS[1]
    categoryAdvertsKey(categoryId, 'send'), // KEYS[2]
    count // ARGV[1]
  )
}

export async function pourCategoryAdvertDone(
  redis: Redis,
  categoryId: number,
  advertId: number
): Promise<void> {
  await redis.pourCategoryAdvertDone(
    categoryAdvertsKey(categoryId, 'send'), // KEYS[1]
    categoryAdvertsKey(categoryId, 'done'), // KEYS[2]
    advertId // ARGV[1]
  )
}

const parseModel = (result: unknown, message: string): AdvertCache | undefined => {
  if (result === null) {
    return undefined
  }

  const hash = parseHash(result, 9, message)

  return {
    id: parseNumber(hash[0], message),
    title: parseString(hash[1], message),
    description: parseString(hash[2], message),
    categoryName: parseString(hash[3], message),
    priceRub: parseNumber(hash[4], message),
    url: parseString(hash[5], message),
    age: parseString(hash[6], message),
    imageUrl: parseString(hash[7], message),
    postedAt: parseNumber(hash[8], message),
  }
}

const parseCollection = (result: unknown, message: string): AdvertCache[] => {
  const collection: AdvertCache[] = []

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
