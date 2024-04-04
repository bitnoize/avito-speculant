import { Redis } from 'ioredis'
import {
  ScraperCache,
  scraperKey,
  scrapersKey,
  avitoUrlScrapersKey,
  categoryScrapersKey,
  advertScrapersKey
} from './scraper-cache.js'
import { proxyKey } from '../proxy-cache/proxy-cache.js'
import {
  parseNumber,
  parseString,
  parseManyStrings,
  parseHash,
  parsePipeline,
  parseCommand
} from '../redis.utils.js'

export async function fetchScraperCache(redis: Redis, scraperId: string): Promise<ScraperCache> {
  const result = await redis.fetchScraperCache(
    scraperKey(scraperId) // KEYS[1]
  )

  return parseModel(result, `ScraperCache fetchScraperCache malformed result`)
}

export async function fetchScrapers(redis: Redis): Promise<string[]> {
  const result = await redis.fetchScrapers(
    scrapersKey() // KEYS[1]
  )

  return parseManyStrings(result, `ScraperCache fetchScrapers malformed result`)
}

export async function fetchAvitoUrlScrapers(redis: Redis, avitoUrl: string): Promise<string[]> {
  const result = await redis.fetchScrapers(
    avitoUrlScrapersKey(avitoUrl) // KEYS[1]
  )

  return parseManyStrings(result, `ScraperCache fetchAvitoUrlScrapers malformed result`)
}

export async function fetchCategoryScrapers(redis: Redis, categoryId: number): Promise<string[]> {
  const result = await redis.fetchScrapers(
    categoryScrapersKey(categoryId) // KEYS[1]
  )

  return parseManyStrings(result, `ScraperCache fetchCategoryScrapers malformed result`)
}

export async function fetchAdvertScrapers(redis: Redis, advertId: number): Promise<string[]> {
  const result = await redis.fetchScrapers(
    advertScrapersKey(advertId) // KEYS[1]
  )

  return parseManyStrings(result, `ScraperCache fetchAdvertScrapers malformed result`)
}

export async function fetchScrapersCache(
  redis: Redis,
  scraperIds: string[]
): Promise<ScraperCache[]> {
  if (scraperIds.length === 0) {
    return []
  }

  const pipeline = redis.pipeline()

  scraperIds.forEach((scraperId) => {
    pipeline.fetchScraperCache(
      scraperKey(scraperId) // KEYS[1]
    )
  })

  const result = await pipeline.exec()

  return parseCollection(result, `ScraperCache fetchScrapersCache malformed result`)
}

export async function dropScraperCache(
  redis: Redis,
  scraperId: string,
  avitoUrl: string
): Promise<void> {
  await redis.dropScraperCache(
    scraperKey(scraperId), // KEYS[1]
    scrapersKey(), // KEYS[2]
    avitoUrlScrapersKey(avitoUrl), // KEYS[3]
    scraperId // ARGV[1]
  )
}

export async function renewSuccessScraperCache(
  redis: Redis,
  scraperId: string,
  proxyId: number,
  sizeBytes: number
): Promise<void> {
  await redis.renewSuccessScraperCache(
    scraperKey(scraperId), // KEYS[1]
    proxyKey(proxyId), // KEYS[2]
    sizeBytes, // ARGV[1]
    Date.now() // ARGV[2]
  )
}

export async function renewFailedScraperCache(
  redis: Redis,
  scraperId: string,
  proxyId: number,
  sizeBytes: number
): Promise<void> {
  await redis.renewFailedScraperCache(
    scraperKey(scraperId), // KEYS[1]
    proxyKey(proxyId), // KEYS[2]
    sizeBytes, // ARGV[1]
    Date.now() // ARGV[2]
  )
}

const parseModel = (result: unknown, message: string): ScraperCache => {
  const hash = parseHash(result, 7, message)

  return {
    id: parseString(hash[0], message),
    avitoUrl: parseString(hash[1], message),
    intervalSec: parseNumber(hash[2], message),
    totalCount: parseNumber(hash[3], message),
    successCount: parseNumber(hash[4], message),
    sizeBytes: parseNumber(hash[5], message),
    time: parseNumber(hash[6], message)
  }
}

const parseCollection = (result: unknown, message: string): ScraperCache[] => {
  const pipeline = parsePipeline(result, message)

  return pipeline.map((pl) => {
    const command = parseCommand(pl, message)
    return parseModel(command, message)
  })
}

/*
export async function saveScraperCache(
  redis: Redis,
  scraperId: string,
  avitoUrl: string,
  intervalSec: number
): Promise<void> {
  await redis.saveScraperCache(
    scraperKey(scraperId), // KEYS[1]
    scrapersKey(), // KEYS[2]
    avitoUrlScrapersKey(avitoUrl), // KEYS[3]
    scraperId, // ARGV[1]
    avitoUrl, // ARGV[2]
    intervalSec, // ARGV[3]
    Date.now() // ARGV[4]
  )
}
*/
