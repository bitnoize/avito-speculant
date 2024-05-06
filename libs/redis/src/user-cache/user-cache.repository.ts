import { Redis } from 'ioredis'
import {
  UserCache,
  WEBAPP_USER_ID_TIMEOUT,
  userCacheKey,
  telegramUserIdKey,
  webappUserIdKey,
  usersIndexKey,
} from './user-cache.js'
import { planCacheKey, plansIndexKey } from '../plan-cache/plan-cache.js'
import {
  subscriptionCacheKey,
  userSubscriptionsIndexKey,
} from '../subscription-cache/subscription-cache.js'
import {
  parseNumber,
  parseNumberOrNull,
  parseManyNumbers,
  parseString,
  parseHash,
  parsePipeline,
  parseCommand
} from '../redis.utils.js'

export async function fetchUserCache(redis: Redis, userId: number): Promise<UserCache | undefined> {
  const result = await redis.fetchUserCache(
    userCacheKey(userId) // KEYS[1]
  )

  return parseModel(result, `fetchUserCache malformed result`)
}

export async function fetchTelegramUserId(
  redis: Redis,
  tgFromId: string
): Promise<number | undefined> {
  const result = await redis.fetchTelegramUserId(
    telegramUserIdKey(tgFromId) // KEYS[1]
  )

  if (result === null) {
    return undefined
  }

  return parseNumber(result, `fetchTelegramUserId malformed result`)
}

export async function fetchWebappUserId(
  redis: Redis,
  token: string
): Promise<number | undefined> {
  const result = await redis.fetchWebappUserId(
    webappUserIdKey(token) // KEYS[1]
  )

  if (result === null) {
    return undefined
  }

  return parseNumber(result, `fetchWebappUserId malformed result`)
}

export async function fetchUsersIndex(redis: Redis): Promise<number[]> {
  const result = await redis.fetchUsersIndex(
    usersIndexKey() // KEYS[1]
  )

  return parseManyNumbers(result, `fetchUsersIndex malformed result`)
}

export async function fetchUsersCache(redis: Redis, userIds: number[]): Promise<UserCache[]> {
  if (userIds.length === 0) {
    return []
  }

  const pipeline = redis.pipeline()

  userIds.forEach((userId) => {
    pipeline.fetchUserCache(
      userCacheKey(userId) // KEYS[1]
    )
  })

  const result = await pipeline.exec()

  return parseCollection(result, `fetchUsersCache malformed result`)
}

export async function savePaidUserCache(
  redis: Redis,
  userId: number,
  userTgFromId: string,
  userSubscriptions: number,
  userCategories: number,
  userBots: number,
  userCreatedAt: number,
  userUpdatedAt: number,
  userQueuedAt: number,
  planId: number,
  planCategoriesMax: number,
  planDurationDays: number,
  planIntervalSec: number,
  planAnalyticsOn: boolean,
  planPriceRub: number,
  planIsEnabled: boolean,
  planSubscriptions: number,
  planCreatedAt: number,
  planUpdatedAt: number,
  planQueuedAt: number,
  subscriptionId: number,
  subscriptionPriceRub: number,
  subscriptionStatus: string,
  subscriptionCreatedAt: number,
  subscriptionUpdatedAt: number,
  subscriptionQueuedAt: number,
  subscriptionTimeoutAt: number,
  subscriptionFinishAt: number
): Promise<void> {
  const multi = redis.multi()

  multi.saveUserCache(
    userCacheKey(userId), // KEYS[1]
    userId, // ARGV[1]
    userTgFromId, // ARGV[2]
    1, // ARGV[3]
    subscriptionId, // ARGV[4]
    userSubscriptions, // ARGV[5]
    userCategories, // ARGV[6]
    userBots, // ARGV[7]
    userCreatedAt, // ARGV[8]
    userUpdatedAt, // ARGV[9]
    userQueuedAt // ARGV[10]
  )

  multi.saveTelegramUserId(
    telegramUserIdKey(userTgFromId), // KEYS[1]
    userId // ARGV[1]
  )

  multi.saveUsersIndex(
    usersIndexKey(), // KEYS[1]
    userId, // ARGV[1]
    userCreatedAt // ARGV[2]
  )

  multi.savePlanCache(
    planCacheKey(planId), // KEYS[1]
    planId, // ARGV[1]
    planCategoriesMax, // ARGV[2]
    planDurationDays, // ARGV[3]
    planIntervalSec, // ARGV[4]
    planAnalyticsOn ? 1 : 0, // ARGV[5]
    planPriceRub, // ARGV[6]
    planIsEnabled ? 1 : 0, // ARGV[7]
    planSubscriptions, // ARGV[8]
    planCreatedAt, // ARGV[9]
    planUpdatedAt, // ARGV[10]
    planQueuedAt // ARGV[11]
  )

  multi.savePlansIndex(
    plansIndexKey(), // KEYS[1]
    planId, // ARGV[1]
    planCreatedAt // ARGV[2]
  )

  multi.saveSubscriptionCache(
    subscriptionCacheKey(subscriptionId), // KEYS[1]
    subscriptionId, // ARGV[1]
    userId, // ARGV[2]
    planId, // ARGV[3]
    subscriptionPriceRub, // ARGV[4]
    subscriptionStatus, // ARGV[5]
    subscriptionCreatedAt, // ARGV[6]
    subscriptionUpdatedAt, // ARGV[7]
    subscriptionQueuedAt, // ARGV[8]
    subscriptionTimeoutAt, // ARGV[9]
    subscriptionFinishAt // ARGV[10]
  )

  multi.saveUserSubscriptionsIndex(
    userSubscriptionsIndexKey(userId), // KEYS[1]
    subscriptionId, // ARGV[1]
    subscriptionCreatedAt // ARGV[2]
  )

  await multi.exec()
}

export async function saveUnpaidUserCache(
  redis: Redis,
  userId: number,
  tgFromId: string,
  subscriptions: number,
  categories: number,
  bots: number,
  createdAt: number,
  updatedAt: number,
  queuedAt: number,
): Promise<void> {
  const multi = redis.multi()

  multi.saveUserCache(
    userCacheKey(userId), // KEYS[1]
    userId, // ARGV[1]
    tgFromId, // ARGV[2]
    0, // ARGV[3]
    null, // ARGV[4]
    subscriptions, // ARGV[5]
    categories, // ARGV[6]
    bots, // ARGV[7]
    createdAt, // ARGV[8]
    updatedAt, // ARGV[9]
    queuedAt // ARGV[10]
  )

  multi.saveTelegramUserId(
    telegramUserIdKey(tgFromId), // KEYS[1]
    userId // ARGV[1]
  )

  multi.saveUsersIndex(
    usersIndexKey(), // KEYS[1]
    userId, // ARGV[1]
    createdAt // ARGV[2]
  )

  await multi.exec()
}

export async function saveWebappUserId(
  redis: Redis,
  token: string,
  userId: number
): Promise<void> {
  await redis.saveWebappUserId(
    webappUserIdKey(token), // KEYS[1]
    userId, // ARGV[1]
    WEBAPP_USER_ID_TIMEOUT // ARGV[2]
  )
}

const parseModel = (result: unknown, message: string): UserCache | undefined => {
  if (result === null) {
    return undefined
  }

  const hash = parseHash(result, 10, message)

  return {
    id: parseNumber(hash[0], message),
    tgFromId: parseString(hash[1], message),
    isPaid: !!parseNumber(hash[2], message),
    subscriptionId: parseNumberOrNull(hash[3], message),
    subscriptions: parseNumber(hash[4], message),
    categories: parseNumber(hash[5], message),
    bots: parseNumber(hash[6], message),
    createdAt: parseNumber(hash[7], message),
    updatedAt: parseNumber(hash[8], message),
    queuedAt: parseNumber(hash[9], message)
  }
}

const parseCollection = (result: unknown, message: string): UserCache[] => {
  const pipeline = parsePipeline(result, message)

  return pipeline
    .map((pl) => {
      const command = parseCommand(pl, message)
      return parseModel(command, message)
    })
    .filter((model) => model !== undefined)
}
