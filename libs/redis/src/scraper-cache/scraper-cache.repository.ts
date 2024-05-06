import { Redis } from 'ioredis'
import {
  ScraperCache,
  scraperCacheKey,
  scrapersIndexKey,
  urlPathScraperIdKey,
  advertScrapersIndexKey
} from './scraper-cache.js'
import { proxyCacheKey } from '../proxy-cache/proxy-cache.js'
import {
  parseNumber,
  parseString,
  parseManyStrings,
  parseHash,
  parsePipeline,
  parseCommand
} from '../redis.utils.js'

export async function fetchScraperCache(
  redis: Redis,
  scraperId: string
): Promise<ScraperCache | undefined> {
  const result = await redis.fetchScraperCache(
    scraperCacheKey(scraperId) // KEYS[1]
  )

  return parseModel(result, `fetchScraperCache malformed result`)
}

export async function fetchScrapersIndex(redis: Redis): Promise<string[]> {
  const result = await redis.fetchScrapers(
    scrapersIndexKey() // KEYS[1]
  )

  return parseManyStrings(result, `fetchScrapersIndex malformed result`)
}

export async function fetchUrlPathScraperId(
  redis: Redis,
  urlPath: string
): Promise<string | undefined> {
  const result = await redis.fetchUrlPathScraperId(
    urlPathScraperIdKey(urlPath) // KEYS[1]
  )

  if (result === null) {
    return undefined
  }

  return parseString(result, `fetchUrlPathScraperId malformed result`)
}

export async function fetchAdvertScrapersIndex(redis: Redis, advertId: number): Promise<string[]> {
  const result = await redis.fetchAdvertScrapersIndex(
    advertScrapersIndexKey(advertId) // KEYS[1]
  )

  return parseManyStrings(result, `fetchAdvertScrapersIndex malformed result`)
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
      scraperCacheKey(scraperId) // KEYS[1]
    )
  })

  const result = await pipeline.exec()

  return parseCollection(result, `fetchScrapersCache malformed result`)
}

export async function saveSuccessScraperCache(
  redis: Redis,
  scraperId: string,
  proxyId: number,
  sizeBytes: number
): Promise<void> {
  const multi = redis.multi()

  multi.saveSuccessScraperCache(
    scraperCacheKey(scraperId), // KEYS[1]
    proxyCacheKey(proxyId), // KEYS[2]
    sizeBytes // ARGV[1]
  )

  await multi.exec()
}

export async function saveFailedScraperCache(
  redis: Redis,
  scraperId: string,
  proxyId: number,
  sizeBytes: number
): Promise<void> {
  const multi = redis.multi()

  multi.saveFailedScraperCache(
    scraperCacheKey(scraperId), // KEYS[1]
    proxyCacheKey(proxyId), // KEYS[2]
    sizeBytes // ARGV[1]
  )

  await multi.exec()
}

const parseModel = (result: unknown, message: string): ScraperCache => {
  const hash = parseHash(result, 5, message)

  return {
    id: parseString(hash[0], message),
    urlPath: parseString(hash[1], message),
    totalCount: parseNumber(hash[2], message),
    successCount: parseNumber(hash[3], message),
    sizeBytes: parseNumber(hash[4], message),
  }
}

const parseCollection = (result: unknown, message: string): ScraperCache[] => {
  const pipeline = parsePipeline(result, message)

  return pipeline
    .map((pl) => {
      const command = parseCommand(pl, message)
      return parseModel(command, message)
    })
    .filter((model) => model !== undefined)
}
