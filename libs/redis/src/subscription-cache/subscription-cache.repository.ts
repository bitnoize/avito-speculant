import { Redis } from 'ioredis'
import {
  SubscriptionCache,
  subscriptionCacheKey,
  userSubscriptionCacheKey,
  planSubscriptionsCacheKey
} from './subscription-cache.js'
import {
  parseNumber,
  parseManyNumbers,
  parseHash,
  parsePipeline,
  parseCommand
} from '../redis.utils.js'

export const fetchSubscriptionCacheLua = `
if redis.call('EXISTS', KEYS[1]) == 0 then
  return nil 
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

  return parseModel(result, `SubscriptionCache fetchModel malformed result`)
}

export const fetchUserSubscriptionCacheIndexLua = `
return redis.call('GET', KEYS[1])
`

export async function fetchUserIndex(redis: Redis, userId: number): Promise<number> {
  const result = await redis.fetchUserSubscriptionCacheIndex(
    userSubscriptionCacheKey(userId) // KEYS[1]
  )

  return parseNumber(result, `SubscriptionCache fetchUserIndex malformed result`)
}

export const fetchPlanSubscriptionsCacheIndexLua = `
return redis.call('SMEMBERS', KEYS[1])
`

export async function fetchPlanIndex(redis: Redis, planId: number): Promise<number[]> {
  const result = await redis.fetchPlanSubscriptionsCacheIndex(
    planSubscriptionsCacheKey(planId) // KEYS[1]
  )

  return parseManyNumbers(result, `SubscriptionCache fetchPlanIndex malformed result`)
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

  const result = await pipeline.exec()

  return parseCollection(result, `SubscriptionCache fetchCollection malformed result`)
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

redis.call('SET', KEYS[2], ARGV[1])

redis.call('SADD', KEYS[3], ARGV[1])

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
  analyticsOn: boolean
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
  )
}

export const dropSubscriptionCacheLua = `
redis.call('DEL', KEYS[1])

redis.call('DEL', KEYS[2])

redis.call('SREM', KEYS[3], ARGV[1])

return redis.status_reply('OK')
`

export async function dropModel(
  redis: Redis,
  subscriptionId: number,
  userId: number,
  planId: number
): Promise<void> {
  await redis.dropSubscriptionCache(
    subscriptionCacheKey(subscriptionId), // KEYS[1]
    userSubscriptionCacheKey(userId), // KEYS[2]
    planSubscriptionsCacheKey(planId), // KEYS[3]
    subscriptionId, // ARGV[1]
  )
}

const parseModel = (result: unknown, message: string): SubscriptionCache => {
  const hash = parseHash(result, 8, message)

  return {
    id: parseNumber(hash[0], message),
    userId: parseNumber(hash[1], message),
    planId: parseNumber(hash[2], message),
    categoriesMax: parseNumber(hash[3], message),
    priceRub: parseNumber(hash[4], message),
    durationDays: parseNumber(hash[5], message),
    intervalSec: parseNumber(hash[6], message),
    analyticsOn: !!parseNumber(hash[7], message)
  }
}

const parseCollection = (result: unknown, message: string): SubscriptionCache[] => {
  const pipeline = parsePipeline(result, message)

  return pipeline.map((pl) => {
    const command = parseCommand(pl, message)
    return parseModel(command, message)
  })
}
