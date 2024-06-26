import { Redis } from 'ioredis'
import {
  ScraperCache,
  scraperCacheKey,
  scrapersIndexKey,
//targetScraperLinkKey
} from './scraper-cache.js'
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

//export async function fetchTargetScraperLink(
//  redis: Redis,
//  urlPath: string
//): Promise<string | undefined> {
//  const result = await redis.fetchScraperLink(
//    targetScraperLinkKey(urlPath) // KEYS[1]
//  )
//
//  if (result === null) {
//    return undefined
//  }
//
//  return parseString(result, `fetchTargetScraperLink malformed result`)
//}

export async function fetchScrapersIndex(redis: Redis): Promise<string[]> {
  const result = await redis.fetchScrapersIndex(
    scrapersIndexKey() // KEYS[1]
  )

  return parseManyStrings(result, `fetchScrapersIndex malformed result`)
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

/*
export async function saveScraperCache(
  redis: Redis,
  scraperId: string,
  urlPath: string
): Promise<void> {
  const multi = redis.multi()

  multi.saveScraperCache(
    scraperCacheKey(scraperId), // KEYS[1]
    scraperId, // ARGV[1]
    urlPath // ARGV[2]
  )

//multi.saveScraperLink(
//  targetScraperLinkKey(urlPath), // KEYS[1]
//  scraperId // ARGV[1]
//)

  multi.saveScrapersIndex(
    scrapersIndexKey(), // KEYS[1]
    scraperId // ARGV[1]
  )

  await multi.exec()
}
*/

export async function saveSuccessScraperCache(redis: Redis, scraperId: string): Promise<void> {
  const multi = redis.multi()

  multi.saveSuccessScraperCache(
    scraperCacheKey(scraperId) // KEYS[1]
  )

  await multi.exec()
}

export async function saveFailedScraperCache(redis: Redis, scraperId: string): Promise<void> {
  const multi = redis.multi()

  multi.saveFailedScraperCache(
    scraperCacheKey(scraperId) // KEYS[1]
  )

  await multi.exec()
}

export async function dropScraperCache(
  redis: Redis,
  scraperId: string,
  urlPath: string
): Promise<void> {
  const multi = redis.multi()

  multi.dropScraperCache(
    scraperCacheKey(scraperId) // KEYS[1]
  )

//multi.dropScraperLink(
//  targetScraperLinkKey(urlPath) // KEYS[1]
//)

  multi.dropScrapersIndex(
    scrapersIndexKey(), // KEYS[1]
    scraperId // ARGV[1]
  )

  await multi.exec()
}

const parseModel = (result: unknown, message: string): ScraperCache | undefined => {
  if (result === null) {
    return undefined
  }

  const hash = parseHash(result, 4, message)

  return {
    id: parseString(hash[0], message),
    urlPath: parseString(hash[1], message),
    totalCount: parseNumber(hash[2], message),
    successCount: parseNumber(hash[3], message)
  }
}

const parseCollection = (result: unknown, message: string): ScraperCache[] => {
  const collection: ScraperCache[] = []

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
