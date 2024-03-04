import { Redis } from 'ioredis'
import { ScraperCache } from './scraper-cache.js'
import { parseNumber, parseString, parseManyStrings } from '../redis.utils.js'
import { REDIS_CACHE_PREFIX } from '../redis.js'

const scraperKey = (scraperJobId: string) => [REDIS_CACHE_PREFIX, 'scraper', scraperJobId].join(':')

const scrapersKey = () => [REDIS_CACHE_PREFIX, 'scrapers'].join(':')

export const saveScraperCacheLua = `
redis.call(
  'HSET', KEYS[1],
  'job_id', ARGV[1],
  'avito_url', ARGV[2],
  'interval_sec', ARGV[3],
)
redis.call('PEXPIRE', KEYS[1], ARGV[4])

redis.call('SADD', KEYS[2], ARGV[1])
redis.call('PEXPIRE', KEYS[3], ARGV[4])

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
    scraperKey(scraperJobId), // KEYS[1]
    scrapersKey(), // KEYS[2]
    scraperJobId, // ARGV[1]
    avitoUrl, // ARGV[2]
    intervalSec, // ARGV[3]
    timeout // ARGV[4]
  )
}

export const fetchScraperCacheLua = `
if redis.call('EXISTS', KEYS[1]) == 0 then
  return redis.error_reply('ERR message ' .. KEYS[1] .. ' lost')
end

local scraper_cache = redis.call(
  'HMGET', KEYS[1],
  'id',
  'avito_url',
  'interval_sec'
)

return {
  unpack(scraper_cache)
}
`

export async function fetchModel(redis: Redis, scraperJobId: string): Promise<ScraperCache> {
  const result = await redis.fetchScraperCache(
    scraperKey(scraperJobId) // KEYS[1]
  )

  return parseModel(result)
}

export const dropScraperCacheLua = `
redis.call('DEL', KEYS[1])
redis.call('SREM', KEYS[2], ARGV[1])
`

export async function dropModel(redis: Redis, scraperJobId: string): Promise<void> {
  await redis.dropScraperCache(
    scraperKey(scraperJobId), // KEYS[1]
    scrapersKey(), // KEYS[2]
    scraperJobId // ARGV[1]
  )
}

export const fetchScrapersCacheIndexLua = `
return redis.call('SMEMBERS', KEYS[1])
`

export async function fetchIndex(redis: Redis): Promise<string[]> {
  const results = await redis.fetchScrapersCacheIndex(
    scrapersKey() // KEYS[1]
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
      scraperKey(scraperJobId) // KEYS[1]
    )
  })

  const results = await pipeline.exec()

  return parseCollection(results)
}

const parseModel = (result: unknown): ScraperCache => {
  if (!(Array.isArray(result) && result.length === 3)) {
    throw new TypeError(`Redis malformed result`)
  }

  return {
    jobId: parseString(result[0]),
    avitoUrl: parseString(result[1]),
    intervalSec: parseNumber(result[2])
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
