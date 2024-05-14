import { Redis } from 'ioredis'
import { AdvertCache, ScraperAdvert, advertCacheKey, advertsIndexKey } from './advert-cache.js'
import {
  parseNumber,
  parseString,
  parseManyNumbers,
  parseHash,
  parsePipeline,
  parseCommand
} from '../redis.utils.js'

export async function fetchAdvertCache(
  redis: Redis,
  scraperId: string,
  advertId: number
): Promise<AdvertCache | undefined> {
  const result = await redis.fetchAdvertCache(
    advertCacheKey(scraperId, advertId) // KEYS[1]
  )

  return parseModel(result, `fetchAdvertCache malformed result`)
}

export async function fetchAdvertsIndex(redis: Redis, scraperId: string): Promise<number[]> {
  const result = await redis.fetchAdvertsIndex(
    advertsIndexKey(scraperId) // KEYS[1]
  )

  return parseManyNumbers(result, `fetchAdvertsIndex malformed result`)
}

export async function fetchAdvertsCache(
  redis: Redis,
  scraperId: string,
  advertIds: number[]
): Promise<AdvertCache[]> {
  if (advertIds.length === 0) {
    return []
  }

  const pipeline = redis.pipeline()

  advertIds.forEach((advertId) => {
    pipeline.fetchAdvertCache(
      advertCacheKey(scraperId, advertId) // KEYS[1]
    )
  })

  const result = await pipeline.exec()

  return parseCollection(result, `fetchAdvertsCache malformed result`)
}

export async function saveAdvertsCache(
  redis: Redis,
  scraperId: string,
  scraperAdverts: ScraperAdvert[]
): Promise<void> {
  if (scraperAdverts.length === 0) {
    return
  }

  const multi = redis.multi()

  scraperAdverts.forEach((scraperAdvert) => {
    const [advertId, title, description, categoryName, priceRub, url, age, imageUrl, postedAt] =
      scraperAdvert

    multi.saveAdvertCache(
      advertCacheKey(scraperId, advertId), // KEYS[1]
      scraperId, // ARGV[1]
      advertId, // ARGV[2]
      title, // ARGV[3]
      description, // ARGV[4]
      categoryName, // ARGV[5]
      priceRub, // ARGV[6]
      url, // ARGV[7]
      age, // ARGV[8]
      imageUrl, // ARGV[9]
      postedAt // ARGV[10]
    )

    multi.saveAdvertsIndex(
      advertsIndexKey(scraperId), // KEYS[1]
      advertId, // ARGV[1]
      postedAt // ARGV[2]
    )
  })

  await multi.exec()
}

export async function dropAdvertCache(
  redis: Redis,
  scraperId: string,
  advertIds: number[]
): Promise<void> {
  const multi = redis.multi()

  advertIds.forEach((advertId) => {
    multi.dropAdvertCache(
      advertCacheKey(scraperId, advertId) // KEYS[1]
    )

    multi.dropAdvertsIndex(
      advertsIndexKey(scraperId), // KEYS[1]
      advertId // ARGV[1]
    )
  })

  await multi.exec()
}

const parseModel = (result: unknown, message: string): AdvertCache | undefined => {
  if (result === null) {
    return undefined
  }

  const hash = parseHash(result, 10, message)

  return {
    scraperId: parseString(hash[0], message),
    advertId: parseNumber(hash[1], message),
    title: parseString(hash[2], message),
    description: parseString(hash[3], message),
    categoryName: parseString(hash[4], message),
    priceRub: parseNumber(hash[5], message),
    url: parseString(hash[6], message),
    age: parseString(hash[7], message),
    imageUrl: parseString(hash[8], message),
    postedAt: parseNumber(hash[9], message)
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
