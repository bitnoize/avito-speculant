import { Redis } from 'ioredis'
import { PlanCache, planCacheKey, plansCacheKey } from './plan-cache.js'
import {
  parseNumber,
  parseManyNumbers,
  parseHash,
  parsePipeline,
  parseCommand
} from '../redis.utils.js'

export const fetchPlanCacheLua = `
if redis.call('EXISTS', KEYS[1]) == 0 then
  return nil 
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

  return parseModel(result, `PlanCache fetchModel malformed result`)
}

export const fetchPlansCacheIndexLua = `
return redis.call('SMEMBERS', KEYS[1])
`

export async function fetchIndex(redis: Redis): Promise<number[]> {
  const result = await redis.fetchPlansCacheIndex(
    plansCacheKey() // KEYS[1]
  )

  return parseManyNumbers(result, `PlanCache fetchIndex malformed result`)
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

  const result = await pipeline.exec()

  return parseCollection(result, `PlanCache fetchCollection malformed result`)
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

redis.call('SADD', KEYS[2], ARGV[1])

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
  )
}

export const dropPlanCacheLua = `
redis.call('DEL', KEYS[1])

redis.call('SREM', KEYS[2], ARGV[1])

return redis.status_reply('OK')
`

export async function dropModel(redis: Redis, planId: number): Promise<void> {
  await redis.dropPlanCache(
    planCacheKey(planId), // KEYS[1]
    plansCacheKey(), // KEYS[2]
    planId, // ARGV[1]
  )
}

const parseModel = (result: unknown, message: string): PlanCache => {
  const hash = parseHash(result, 6, message)

  return {
    id: parseNumber(hash[0], message),
    categoriesMax: parseNumber(hash[1], message),
    priceRub: parseNumber(hash[2], message),
    durationDays: parseNumber(hash[3], message),
    intervalSec: parseNumber(hash[4], message),
    analyticsOn: !!parseNumber(hash[5], message)
  }
}

const parseCollection = (result: unknown, message: string): PlanCache[] => {
  const pipeline = parsePipeline(result, message)

  return pipeline.map((pl) => {
    const command = parseCommand(pl, message)
    return parseModel(command, message)
  })
}
