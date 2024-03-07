import { Redis } from 'ioredis'
import {
  SubscriptionCache,
  subscriptionCacheKey,
  userSubscriptionCacheKey,
  planSubscriptionsCacheKey
} from './subscription-cache.js'
import { parseNumber, parseManyNumbers } from '../redis.utils.js'

export const fetchSubscriptionCacheLua = `
if redis.call('EXISTS', KEYS[1]) == 0 then
  return redis.error_reply('ERR message ' .. KEYS[1] .. ' lost')
end

local subscription_cache = redis.call(
  'HMGET', KEYS[1],
  'id',
  'user_id',
  'plan_id',
  'categories_max',
  'price_rub',
  'duration_days',
  'interval_sec',
  'analytics_on'
)

return {
  unpack(subscription_cache)
}
`

export async function fetchModel(redis: Redis, subscriptionId: number): Promise<SubscriptionCache> {
  const result = await redis.fetchSubscriptionCache(
    subscriptionCacheKey(subscriptionId) // KEYS[1]
  )

  return parseModel(result)
}

export const saveSubscriptionCacheLua = `
redis.call(
  'HSET', KEYS[1],
  'id', ARGV[1],
  'user_id', ARGV[2],
  'plan_id', ARGV[3],
  'categories_max', ARGV[4],
  'price_rub', ARGV[5],
  'duration_days', ARGV[6],
  'interval_sec', ARGV[7],
  'analytics_on', ARGV[8]
)
redis.call('PEXPIRE', KEYS[1], ARGV[9])

redis.call('SET', KEYS[2], ARGV[1])
redis.call('PEXPIRE', KEYS[2], ARGV[9])

redis.call('SADD', KEYS[3], ARGV[1])
redis.call('PEXPIRE', KEYS[3], ARGV[9])

return redis.status_reply('OK')
`

export async function saveModel(
  redis: Redis,
  subscriptionId: number,
  userId: number,
  planId: number,
  categoriesMax: number,
  priceRub: number,
  durationDays: number,
  intervalSec: number,
  analyticsOn: boolean,
  timeout: number
): Promise<void> {
  await redis.saveSubscriptionCache(
    subscriptionCacheKey(subscriptionId), // KEYS[1]
    userSubscriptionCacheKey(userId), // KEYS[2]
    planSubscriptionsCacheKey(planId), // KEYS[3]
    subscriptionId, // ARGV[1]
    userId, // ARGV[2]
    planId, // ARGV[3]
    categoriesMax, // ARGV[4]
    priceRub, // ARGV[5]
    durationDays, // ARGV[6]
    intervalSec, // ARGV[7]
    analyticsOn ? 1 : 0, // ARGV[8]
    timeout // ARGV[9]
  )
}

export const dropSubscriptionCacheLua = `
redis.call('DEL', KEYS[1])

redis.call('DEL', KEYS[2])

redis.call('SREM', KEYS[3], ARGV[1])
redis.call('PEXPIRE', KEYS[2], ARGV[2])

return redis.status_reply('OK')
`

export async function dropModel(
  redis: Redis,
  subscriptionId: number,
  userId: number,
  planId: number,
  timeout: number
): Promise<void> {
  await redis.dropSubscriptionCache(
    subscriptionCacheKey(subscriptionId), // KEYS[1]
    userSubscriptionCacheKey(userId), // KEYS[2]
    planSubscriptionsCacheKey(planId), // KEYS[3]
    subscriptionId, // ARGV[1]
    timeout // ARGV[2]
  )
}

export const fetchUserSubscriptionCacheIndexLua = `
return redis.call('GET', KEYS[1])
`

export async function fetchUserIndex(redis: Redis, userId: number): Promise<number> {
  const result = await redis.fetchUserSubscriptionCacheIndex(
    userSubscriptionCacheKey(userId) // KEYS[1]
  )

  return parseNumber(result)
}

export const fetchPlanSubscriptionsCacheIndexLua = `
return redis.call('SMEMBERS', KEYS[1])
`

export async function fetchPlanIndex(redis: Redis, planId: number): Promise<number[]> {
  const result = await redis.fetchPlanSubscriptionsCacheIndex(
    planSubscriptionsCacheKey(planId) // KEYS[1]
  )

  return parseManyNumbers(result)
}

export async function fetchCollection(
  redis: Redis,
  subscriptionIds: number[]
): Promise<SubscriptionCache[]> {
  if (subscriptionIds.length === 0) {
    return []
  }

  const pipeline = redis.pipeline()

  subscriptionIds.forEach((subscriptionId) => {
    pipeline.fetchSubscriptionCache(
      subscriptionCacheKey(subscriptionId) // KEYS[1]
    )
  })

  const results = await pipeline.exec()

  return parseCollection(results)
}

const parseModel = (result: unknown): SubscriptionCache => {
  if (!(Array.isArray(result) && result.length === 8)) {
    throw new TypeError(`Redis malformed result`)
  }

  return {
    id: parseNumber(result[0]),
    userId: parseNumber(result[1]),
    planId: parseNumber(result[2]),
    categoriesMax: parseNumber(result[3]),
    priceRub: parseNumber(result[4]),
    durationDays: parseNumber(result[5]),
    intervalSec: parseNumber(result[6]),
    analyticsOn: !!parseNumber(result[7])
  }
}

const parseCollection = (results: unknown): SubscriptionCache[] => {
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
