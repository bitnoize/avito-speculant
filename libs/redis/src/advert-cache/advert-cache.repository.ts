import { Redis } from 'ioredis'
import { AdvertCache, advertKey, scraperAdvertsKey, categoryAdvertsKey } from './advert-cache.js'
import {
  parseNumber,
  parseString,
  parseManyNumbers,
  parseHash,
  parsePipeline,
  parseCommand
} from '../redis.utils.js'

export async function fetchAdvertCache(redis: Redis, advertId: number): Promise<AdvertCache> {
  const result = await redis.fetchAdvertCache(
    advertKey(advertId) // KEYS[1]
  )

  return parseModel(result, `AdvertCache fetchAdvertCache malformed result`)
}

export async function fetchScraperAdverts(redis: Redis, scraperId: string): Promise<number[]> {
  const result = await redis.fetchScraperAdverts(
    scraperAdvertsKey(scraperId) // KEYS[1]
  )

  return parseManyNumbers(result, `AdvertCache fetchScraperAdverts malformed result`)
}

export async function fetchCategoryAdverts(
  redis: Redis,
  categoryId: number,
  topic: string
): Promise<number[]> {
  const result = await redis.fetchCategoryAdverts(
    categoryAdvertsKey(categoryId, topic) // KEYS[1]
  )

  return parseManyNumbers(result, `AdvertCache fetchCategoryAdverts malformed result`)
}

export async function fetchAdvertsCache(redis: Redis, advertIds: number[]): Promise<AdvertCache[]> {
  if (advertIds.length === 0) {
    return []
  }

  const pipeline = redis.pipeline()

  advertIds.forEach((advertId) => {
    pipeline.fetchAdvertCache(
      advertKey(advertId) // KEYS[1]
    )
  })

  const result = await pipeline.exec()

  return parseCollection(result, `AdvertCache fetchAdvertsCache malformed result`)
}

export async function saveAdvertCache(
  redis: Redis,
  advertId: number,
  scraperId: string,
  categoryId: number,
  title: string,
  priceRub: number,
  url: string,
  age: number,
  imageUrl: string,
  topic: string
): Promise<void> {
  await redis.saveAdvertCache(
    advertKey(advertId), // KEYS[1]
    scraperAdvertsKey(scraperId), // KEYS[2]
    categoryAdvertsKey(categoryId, topic), // KEYS[3]
    advertId, // ARGV[1]
    title, // ARGV[2]
    priceRub, // ARGV[3]
    url, // ARGV[4]
    age, // ARGV[5]
    imageUrl, // ARGV[6]
    topic, // ARGV[7]
    Date.now() // ARGV[8]
  )
}

export async function dropAdvertCache(
  redis: Redis,
  advertId: number,
  scraperId: string,
  categoryId: number
): Promise<void> {
  await redis.dropAdvertCache(
    advertKey(advertId), // KEYS[1]
    scraperAdvertsKey(scraperId), // KEYS[2]
    categoryAdvertsKey(categoryId, 'wait'), // KEYS[3]
    advertId // ARGV[1]
  )
}

const parseModel = (result: unknown, message: string): AdvertCache => {
  const hash = parseHash(result, 8, message)

  return {
    id: parseNumber(hash[0], message),
    title: parseString(hash[1], message),
    priceRub: parseNumber(hash[2], message),
    url: parseString(hash[3], message),
    age: parseNumber(hash[4], message),
    imageUrl: parseString(hash[5], message),
    topic: parseString(hash[6], message),
    time: parseNumber(hash[7], message)
  }
}

const parseCollection = (result: unknown, message: string): AdvertCache[] => {
  const pipeline = parsePipeline(result, message)

  return pipeline.map((pl) => {
    const command = parseCommand(pl, message)
    return parseModel(command, message)
  })
}
