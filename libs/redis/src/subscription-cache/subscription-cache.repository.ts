import { Redis } from 'ioredis'
import {
  SubscriptionCache,
  subscriptionKey,
  userSubscriptionsKey,
  planSubscriptionsKey
} from './subscription-cache.js'
import {
  parseNumber,
  parseManyNumbers,
  parseHash,
  parsePipeline,
  parseCommand
} from '../redis.utils.js'

export async function fetchSubscriptionCache(
  redis: Redis,
  subscriptionId: number
): Promise<SubscriptionCache> {
  const result = await redis.fetchSubscriptionCache(
    subscriptionKey(subscriptionId) // KEYS[1]
  )

  return parseModel(result, `SubscriptionCache fetchSubscriptionCache malformed result`)
}

export async function fetchUserSubscriptions(redis: Redis, userId: number): Promise<number[]> {
  const result = await redis.fetchSubscriptions(
    userSubscriptionsKey(userId) // KEYS[1]
  )

  return parseManyNumbers(result, `SubscriptionCache fetchUserSubscriptions malformed result`)
}

export async function fetchPlanSubscriptions(redis: Redis, planId: number): Promise<number[]> {
  const result = await redis.fetchSubscriptions(
    planSubscriptionsKey(planId) // KEYS[1]
  )

  return parseManyNumbers(result, `SubscriptionCache fetchPlanSubscriptions malformed result`)
}

export async function fetchSubscriptionsCache(
  redis: Redis,
  subscriptionIds: number[]
): Promise<SubscriptionCache[]> {
  if (subscriptionIds.length === 0) {
    return []
  }

  const pipeline = redis.pipeline()

  subscriptionIds.forEach((subscriptionId) => {
    pipeline.fetchSubscriptionCache(
      subscriptionKey(subscriptionId) // KEYS[1]
    )
  })

  const result = await pipeline.exec()

  return parseCollection(result, `SubscriptionCache fetchSubscriptionsCache malformed result`)
}

export async function saveSubscriptionCache(
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
    subscriptionKey(subscriptionId), // KEYS[1]
    userSubscriptionsKey(userId), // KEYS[2]
    planSubscriptionsKey(planId), // KEYS[3]
    subscriptionId, // ARGV[1]
    userId, // ARGV[2]
    planId, // ARGV[3]
    categoriesMax, // ARGV[4]
    priceRub, // ARGV[5]
    durationDays, // ARGV[6]
    intervalSec, // ARGV[7]
    analyticsOn ? 1 : 0, // ARGV[8]
    Date.now() // ARGV[9]
  )
}

export async function dropSubscriptionCache(
  redis: Redis,
  subscriptionId: number,
  userId: number,
  planId: number
): Promise<void> {
  await redis.dropSubscriptionCache(
    subscriptionKey(subscriptionId), // KEYS[1]
    userSubscriptionsKey(userId), // KEYS[2]
    planSubscriptionsKey(planId), // KEYS[3]
    subscriptionId // ARGV[1]
  )
}

const parseModel = (result: unknown, message: string): SubscriptionCache => {
  const hash = parseHash(result, 9, message)

  return {
    id: parseNumber(hash[0], message),
    userId: parseNumber(hash[1], message),
    planId: parseNumber(hash[2], message),
    categoriesMax: parseNumber(hash[3], message),
    priceRub: parseNumber(hash[4], message),
    durationDays: parseNumber(hash[5], message),
    intervalSec: parseNumber(hash[6], message),
    analyticsOn: !!parseNumber(hash[7], message),
    time: parseNumber(hash[8], message)
  }
}

const parseCollection = (result: unknown, message: string): SubscriptionCache[] => {
  const pipeline = parsePipeline(result, message)

  return pipeline.map((pl) => {
    const command = parseCommand(pl, message)
    return parseModel(command, message)
  })
}
