import { Redis } from 'ioredis'
import { PlanCache, planCacheKey, plansCacheKey } from './plan-cache.js'
import { REDIS_CACHE_TIMEOUT } from '../redis.js'
import { parseNumber, parseManyNumbers } from '../redis.utils.js'

export const fetchPlanCacheLua = `
if redis.call('EXISTS', KEYS[1]) == 0 then
  return redis.error_reply('ERR message ' .. KEYS[1] .. ' lost')
end

local plan_cache = redis.call(
  'HMGET', KEYS[1],
  'id',
  'categories_max',
  'price_rub',
  'duration_days',
  'interval_sec',
  'analytics_on'
)

return {
  unpack(plan_cache)
}
`

export async function fetchModel(redis: Redis, planId: number): Promise<PlanCache> {
  const result = await redis.fetchPlanCache(
    planCacheKey(planId) // KEYS[1]
  )

  return parseModel(result)
}

export const fetchPlansCacheIndexLua = `
return redis.call('SMEMBERS', KEYS[1])
`

export async function fetchIndex(redis: Redis): Promise<number[]> {
  const results = await redis.fetchPlansCacheIndex(
    plansCacheKey() // KEYS[1]
  )

  return parseManyNumbers(results)
}

export async function fetchCollection(redis: Redis, planIds: number[]): Promise<PlanCache[]> {
  if (planIds.length === 0) {
    return []
  }

  const pipeline = redis.pipeline()

  planIds.forEach((planId) => {
    pipeline.fetchPlanCache(
      planCacheKey(planId) // KEYS[1]
    )
  })

  const results = await pipeline.exec()

  return parseCollection(results)
}

export const savePlanCacheLua = `
redis.call(
  'HSET', KEYS[1],
  'id', ARGV[1],
  'categories_max', ARGV[2],
  'price_rub', ARGV[3],
  'duration_days', ARGV[4],
  'interval_sec', ARGV[5],
  'analytics_on', ARGV[6]
)
redis.call('PEXPIRE', KEYS[1], ARGV[7])

redis.call('SADD', KEYS[2], ARGV[1])
redis.call('PEXPIRE', KEYS[2], ARGV[7])

return redis.status_reply('OK')
`

export async function saveModel(
  redis: Redis,
  planId: number,
  categoriesMax: number,
  priceRub: number,
  durationDays: number,
  intervalSec: number,
  analyticsOn: boolean
): Promise<void> {
  await redis.savePlanCache(
    planCacheKey(planId), // KEYS[1]
    plansCacheKey(), // KEYS[2]
    planId, // ARGV[1]
    categoriesMax, // ARGV[2]
    priceRub, // ARGV[3]
    durationDays, // ARGV[4]
    intervalSec, // ARGV[5]
    analyticsOn ? 1 : 0, // ARGV[6]
    REDIS_CACHE_TIMEOUT // ARGV[7]
  )
}

export const dropPlanCacheLua = `
redis.call('DEL', KEYS[1])

redis.call('SREM', KEYS[2], ARGV[1])
redis.call('PEXPIRE', KEYS[2], ARGV[2])

return redis.status_reply('OK')
`

export async function dropModel(redis: Redis, planId: number): Promise<void> {
  await redis.dropPlanCache(
    planCacheKey(planId), // KEYS[1]
    plansCacheKey(), // KEYS[2]
    planId, // ARGV[1]
    REDIS_CACHE_TIMEOUT // ARGV[2]
  )
}

const parseModel = (result: unknown): PlanCache => {
  if (!(Array.isArray(result) && result.length === 6)) {
    throw new TypeError(`Redis malformed result`)
  }

  return {
    id: parseNumber(result[0]),
    categoriesMax: parseNumber(result[1]),
    priceRub: parseNumber(result[2]),
    durationDays: parseNumber(result[3]),
    intervalSec: parseNumber(result[4]),
    analyticsOn: !!parseNumber(result[5])
  }
}

const parseCollection = (results: unknown): PlanCache[] => {
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
