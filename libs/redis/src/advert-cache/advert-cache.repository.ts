import { Redis } from 'ioredis'
import { AdvertCache, AvitoAdvert, advertKey, scraperAdvertsKey } from './advert-cache.js'
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

export async function saveAdvertsCache(
  redis: Redis,
  scraperId: string,
  avitoAdverts: AvitoAdvert[],
): Promise<void> {
  if (avitoAdverts.length === 0) {
    return
  }

  const pipeline = redis.pipeline()

  avitoAdverts.forEach((avitoAdvert) => {
    pipeline.saveAdvertCache(
      advertKey(avitoAdvert.id), // KEYS[1]
      scraperAdvertsKey(scraperId), // KEYS[2]
      avitoAdvert.id, // ARGV[1]
      avitoAdvert.title, // ARGV[2]
      avitoAdvert.priceRub, // ARGV[3]
      avitoAdvert.url, // ARGV[4]
      avitoAdvert.age, // ARGV[5]
      avitoAdvert.imageUrl, // ARGV[6]
      Date.now() // ARGV[7]
    )
  })

  await pipeline.exec()
}

export async function dropAdvertCache(
  redis: Redis,
  advertId: number,
  scraperId: string,
): Promise<void> {
  await redis.dropAdvertCache(
    advertKey(advertId), // KEYS[1]
    scraperAdvertsKey(scraperId), // KEYS[2]
    advertId // ARGV[1]
  )
}

const parseModel = (result: unknown, message: string): AdvertCache => {
  const hash = parseHash(result, 7, message)

  return {
    id: parseNumber(hash[0], message),
    title: parseString(hash[1], message),
    priceRub: parseNumber(hash[2], message),
    url: parseString(hash[3], message),
    age: parseNumber(hash[4], message),
    imageUrl: parseString(hash[5], message),
    time: parseNumber(hash[6], message)
  }
}

const parseCollection = (result: unknown, message: string): AdvertCache[] => {
  const pipeline = parsePipeline(result, message)

  return pipeline.map((pl) => {
    const command = parseCommand(pl, message)
    return parseModel(command, message)
  })
}
