import { Redis } from 'ioredis'
import {
  ScraperCache,
  scraperCacheKey,
  scraperCacheAvitoUrlKey,
  scrapersCacheKey
} from './scraper-cache.js'
import { REDIS_CACHE_TIMEOUT } from '../redis.js'
import {
  parseNumber,
  parseString,
  parseManyStrings,
  parseHash,
  parsePipeline,
  parseCommand
} from '../redis.utils.js'

export const fetchScraperCacheLua = `
if redis.call('EXISTS', KEYS[1]) == 0 then
  return nil 
end

local scraper_cache = redis.call(
  'HMGET', KEYS[1],
  'id',
  'avito_url',
  'interval_sec',
  'total_count',
  'success_count'
)

return {
  unpack(scraper_cache)
}
`

export async function fetchModel(redis: Redis, scraperId: string): Promise<ScraperCache> {
  const result = await redis.fetchScraperCache(
    scraperCacheKey(scraperId) // KEYS[1]
  )

  return parseModel(result, `ScraperCache fetchModel malformed result`)
}

export const findScraperCacheAvitoUrlIndexLua = `
return redis.call('GET', KEYS[1])
`

export async function findAvitoUrlIndex(
  redis: Redis,
  avitoUrl: string
): Promise<string | undefined> {
  const result = await redis.findScraperCacheAvitoUrlIndex(
    scraperCacheAvitoUrlKey(avitoUrl) // KEYS[1]
  )

  if (result == null) {
    return undefined
  }

  return parseString(result, `ScraperCache findAvitoUrlIndex malformed result`)
}

export const fetchScrapersCacheIndexLua = `
return redis.call('SMEMBERS', KEYS[1])
`

export async function fetchIndex(redis: Redis): Promise<string[]> {
  const result = await redis.fetchScrapersCacheIndex(
    scrapersCacheKey() // KEYS[1]
  )

  return parseManyStrings(result, `ScraperCache fetchIndex malformed result`)
}

export async function fetchCollection(
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

  return parseCollection(result, `ScraperCache fetchCollection malformed result`)
}

export const saveScraperCacheLua = `
redis.call(
  'HSET', KEYS[1],
  'id', ARGV[1],
  'avito_url', ARGV[2],
  'interval_sec', ARGV[3]
)
redis.call('HSETNX', KEYS[1], 'total_count', 0)
redis.call('HSETNX', KEYS[1], 'success_count', 0)
redis.call('PEXPIRE', KEYS[1], ARGV[4])

redis.call('SET', KEYS[2], ARGV[2])
redis.call('PEXPIRE', KEYS[2], ARGV[4])

redis.call('SADD', KEYS[3], ARGV[1])
redis.call('PEXPIRE', KEYS[3], ARGV[4])

return redis.status_reply('OK')
`

export async function saveModel(
  redis: Redis,
  scraperId: string,
  avitoUrl: string,
  intervalSec: number
): Promise<void> {
  await redis.saveScraperCache(
    scraperCacheKey(scraperId), // KEYS[1]
    scraperCacheAvitoUrlKey(avitoUrl), // KEYS[2]
    scrapersCacheKey(), // KEYS[3]
    scraperId, // ARGV[1]
    avitoUrl, // ARGV[2]
    intervalSec, // ARGV[3]
    REDIS_CACHE_TIMEOUT // ARGV[4]
  )
}

export const dropScraperCacheLua = `
redis.call('DEL', KEYS[1])

redis.call('DEL', KEYS[2])

redis.call('SREM', KEYS[3], ARGV[1])
redis.call('PEXPIRE', KEYS[3], ARGV[2])
`

export async function dropModel(
  redis: Redis,
  scraperId: string,
  avitoUrl: string
): Promise<void> {
  await redis.dropScraperCache(
    scraperCacheKey(scraperId), // KEYS[1]
    scraperCacheAvitoUrlKey(avitoUrl), // KEYS[2]
    scrapersCacheKey(), // KEYS[3]
    scraperId, // ARGV[1]
    REDIS_CACHE_TIMEOUT // ARGV[2]
  )
}

const parseModel = (result: unknown, message: string): ScraperCache => {
  const hash = parseHash(result, 5, message)

  return {
    id: parseString(hash[0], message),
    avitoUrl: parseString(hash[1], message),
    intervalSec: parseNumber(hash[2], message),
    totalCount: parseNumber(hash[3], message),
    successCount: parseNumber(hash[4], message)
  }
}

const parseCollection = (result: unknown, message: string): ScraperCache[] => {
  const pipeline = parsePipeline(result, message)

  return pipeline.map((pl) => {
    const command = parseCommand(pl, message)
    return parseModel(command, message)
  })
}
