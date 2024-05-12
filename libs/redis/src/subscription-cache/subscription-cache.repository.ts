import { Redis } from 'ioredis'
import {
  SubscriptionCache,
  subscriptionCacheKey,
  userActiveSubscriptionLinkKey,
  userSubscriptionsIndexKey
} from './subscription-cache.js'
import {
  parseNumber,
  parseManyNumbers,
  parseString,
  parseHash,
  parsePipeline,
  parseCommand
} from '../redis.utils.js'

export async function fetchSubscriptionCache(
  redis: Redis,
  subscriptionId: number
): Promise<SubscriptionCache | undefined> {
  const result = await redis.fetchSubscriptionCache(
    subscriptionCacheKey(subscriptionId) // KEYS[1]
  )

  return parseModel(result, `fetchSubscriptionCache malformed result`)
}

export async function fetchUserActiveSubscriptionLink(
  redis: Redis,
  userId: number
): Promise<number | undefined> {
  const result = await redis.fetchSubscriptionLink(
    userActiveSubscriptionLinkKey(userId) // KEYS[1]
  )

  if (result === null) {
    return undefined
  }

  return parseNumber(result, `fetchUserActiveSubscriptionLink malformed result`)
}

export async function fetchUserSubscriptionsIndex(
  redis: Redis,
  userId: number
): Promise<number[]> {
  const result = await redis.fetchSubscriptionsIndex(
    userSubscriptionsIndexKey(userId) // KEYS[1]
  )

  return parseManyNumbers(result, `fetchUserSubscriptionsIndex malformed result`)
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
      subscriptionCacheKey(subscriptionId) // KEYS[1]
    )
  })

  const result = await pipeline.exec()

  return parseCollection(result, `fetchSubscriptionsCache malformed result`)
}

export async function saveSubscriptionCache(
  redis: Redis,
  subscriptionId: number,
  userId: number,
  planId: number,
  priceRub: number,
  status: string,
  createdAt: number,
  updatedAt: number,
  queuedAt: number,
  timeoutAt: number,
  finishAt: number
): Promise<void> {
  const multi = redis.multi()

  multi.saveSubscriptionCache(
    subscriptionCacheKey(subscriptionId), // KEYS[1]
    subscriptionId, // ARGV[1]
    userId, // ARGV[2]
    planId, // ARGV[3]
    priceRub, // ARGV[4]
    status, // ARGV[5]
    createdAt, // ARGV[6]
    updatedAt, // ARGV[7]
    queuedAt, // ARGV[8]
    timeoutAt, // ARGV[9]
    finishAt // ARGV[10]
  )

  multi.saveSubscriptionsIndex(
    userSubscriptionsIndexKey(userId), // KEYS[1]
    subscriptionId, // ARGV[1]
    createdAt // ARGV[2]
  )

  await multi.exec()
}

export async function dropSubscriptionCache(
  redis: Redis,
  subscriptionId: number,
  userId: number
): Promise<void> {
  const multi = redis.multi()

  multi.dropSubscriptionCache(
    subscriptionCacheKey(subscriptionId) // KEYS[1]
  )

  multi.dropSubscriptionsIndex(
    userSubscriptionsIndexKey(userId), // KEYS[1]
    subscriptionId // ARGV[1]
  )

  await multi.exec()
}

const parseModel = (result: unknown, message: string): SubscriptionCache | undefined => {
  if (result === null) {
    return undefined
  }

  const hash = parseHash(result, 10, message)

  return {
    id: parseNumber(hash[0], message),
    userId: parseNumber(hash[1], message),
    planId: parseNumber(hash[2], message),
    priceRub: parseNumber(hash[3], message),
    status: parseString(hash[4], message),
    createdAt: parseNumber(hash[5], message),
    updatedAt: parseNumber(hash[6], message),
    queuedAt: parseNumber(hash[7], message),
    timeoutAt: parseNumber(hash[8], message),
    finishAt: parseNumber(hash[9], message)
  }
}

const parseCollection = (result: unknown, message: string): SubscriptionCache[] => {
  const collection: SubscriptionCache[] = []

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
