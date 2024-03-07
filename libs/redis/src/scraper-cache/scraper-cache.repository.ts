import { Redis } from 'ioredis'
import { ScraperCache, scraperCacheKey, scrapersCacheKey } from './scraper-cache.js'
import { parseNumber, parseString, parseManyStrings } from '../redis.utils.js'

export const fetchScraperCacheLua = `
if redis.call('EXISTS', KEYS[1]) == 0 then
  return redis.error_reply('ERR message ' .. KEYS[1] .. ' lost')
end

local scraper_cache = redis.call(
  'HMGET', KEYS[1],
  'job_id',
  'avito_url',
  'interval_sec',
  'total_count',
  'success_count'
)

return {
  unpack(scraper_cache)
}
`

export async function fetchModel(redis: Redis, scraperJobId: string): Promise<ScraperCache> {
  const result = await redis.fetchScraperCache(
    scraperCacheKey(scraperJobId) // KEYS[1]
  )

  return parseModel(result)
}

export const saveScraperCacheLua = `
redis.call(
  'HSET', KEYS[1],
  'job_id', ARGV[1],
  'avito_url', ARGV[2],
  'interval_sec', ARGV[3],
)
redis.call('HSETNX', KEYS[1], 'total_count', 0)
redis.call('HSETNX', KEYS[1], 'success_count', 0)
redis.call('PEXPIRE', KEYS[1], ARGV[4])

redis.call('SADD', KEYS[2], ARGV[1])
redis.call('PEXPIRE', KEYS[2], ARGV[4])

return redis.status_reply('OK')
`

export async function saveModel(
  redis: Redis,
  scraperJobId: string,
  avitoUrl: string,
  intervalSec: number,
  timeout: number
): Promise<void> {
  await redis.saveScraperCache(
    scraperCacheKey(scraperJobId), // KEYS[1]
    scrapersCacheKey(), // KEYS[2]
    scraperJobId, // ARGV[1]
    avitoUrl, // ARGV[2]
    intervalSec, // ARGV[3]
    timeout // ARGV[4]
  )
}

export const dropScraperCacheLua = `
redis.call('DEL', KEYS[1])

redis.call('SREM', KEYS[2], ARGV[1])
redis.call('PEXPIRE', KEYS[2], ARGV[2])
`

export async function dropModel(
  redis: Redis,
  scraperJobId: string,
  timeout: number
): Promise<void> {
  await redis.dropScraperCache(
    scraperCacheKey(scraperJobId), // KEYS[1]
    scrapersCacheKey(), // KEYS[2]
    scraperJobId, // ARGV[1]
    timeout // ARGV[2]
  )
}

export const fetchScrapersCacheIndexLua = `
return redis.call('SMEMBERS', KEYS[1])
`

export async function fetchIndex(redis: Redis): Promise<string[]> {
  const results = await redis.fetchScrapersCacheIndex(
    scrapersCacheKey() // KEYS[1]
  )

  return parseManyStrings(results)
}

export async function fetchCollection(
  redis: Redis,
  scraperJobIds: string[]
): Promise<ScraperCache[]> {
  if (scraperJobIds.length === 0) {
    return []
  }

  const pipeline = redis.pipeline()

  scraperJobIds.forEach((scraperJobId) => {
    pipeline.fetchScraperCache(
      scraperCacheKey(scraperJobId) // KEYS[1]
    )
  })

  const results = await pipeline.exec()

  return parseCollection(results)
}

const parseModel = (result: unknown): ScraperCache => {
  if (!(Array.isArray(result) && result.length === 5)) {
    throw new TypeError(`Redis malformed result`)
  }

  return {
    jobId: parseString(result[0]),
    avitoUrl: parseString(result[1]),
    intervalSec: parseNumber(result[2]),
    totalCount: parseNumber(result[3]),
    successCount: parseNumber(result[4])
  }
}

const parseCollection = (results: unknown): ScraperCache[] => {
  if (!Array.isArray(results)) {
    throw new TypeError(`Redis malformed results`)
  }

  return results.map((result) => {
    if (!Array.isArray(result)) {
      throw new TypeError(`Redis malformed result`)
    }

    return parseModel(result[1])
  })
}
