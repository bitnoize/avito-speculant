import { Redis } from 'ioredis'
import {
  UserCache,
  WEBAPP_TOKEN_TIMEOUT,
  userCacheKey,
  telegramUserLinkKey,
  webappUserLinkKey,
  usersIndexKey
} from './user-cache.js'
import { userActiveSubscriptionLinkKey } from '../subscription-cache/subscription-cache.js'
import {
  parseNumber,
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

export async function fetchTelegramUserLink(
  redis: Redis,
  tgFromId: string
): Promise<number | undefined> {
  const result = await redis.fetchUserLink(
    telegramUserLinkKey(tgFromId) // KEYS[1]
  )

  if (result === null) {
    return undefined
  }

  return parseNumber(result, `fetchTelegramUserLink malformed result`)
}

export async function fetchWebappUserLink(
  redis: Redis,
  token: string
): Promise<number | undefined> {
  const result = await redis.fetchUserLink(
    webappUserLinkKey(token) // KEYS[1]
  )

  if (result === null) {
    return undefined
  }

  return parseNumber(result, `fetchWebappUserLink malformed result`)
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

export async function saveUserCache(
  redis: Redis,
  userId: number,
  tgFromId: string,
  activeSubscriptionId: number | null,
  subscriptions: number,
  categories: number,
  bots: number,
  createdAt: number,
  updatedAt: number,
  queuedAt: number
): Promise<void> {
  const multi = redis.multi()

  multi.saveUserCache(
    userCacheKey(userId), // KEYS[1]
    userId, // ARGV[1]
    tgFromId, // ARGV[2]
    activeSubscriptionId, // ARGV[3]
    subscriptions, // ARGV[4]
    categories, // ARGV[5]
    bots, // ARGV[6]
    createdAt, // ARGV[7]
    updatedAt, // ARGV[8]
    queuedAt // ARGV[9]
  )

  multi.saveUserLink(
    telegramUserLinkKey(tgFromId), // KEYS[1]
    userId // ARGV[1]
  )

  multi.saveUsersIndex(
    usersIndexKey(), // KEYS[1]
    userId, // ARGV[1]
    createdAt // ARGV[2]
  )

  if (activeSubscriptionId !== null) {
    multi.saveSubscriptionLink(
      userActiveSubscriptionLinkKey(userId), // KEYS[1]
      activeSubscriptionId // ARGV[1]
    )
  } else {
    multi.dropSubscriptionLink(
      userActiveSubscriptionLinkKey(userId) // KEYS[1]
    )
  }

  await multi.exec()
}

export async function saveWebappUserLink(
  redis: Redis,
  token: string,
  userId: number
): Promise<void> {
  await redis.saveUserLinkTimeout(
    webappUserLinkKey(token), // KEYS[1]
    userId, // ARGV[1]
    WEBAPP_TOKEN_TIMEOUT // ARGV[2]
  )
}

export async function dropUserCache(redis: Redis, userId: number, tgFromId: string): Promise<void> {
  const multi = redis.multi()

  multi.dropUserCache(
    userCacheKey(userId) // KEYS[1]
  )

  multi.dropUserLink(
    telegramUserLinkKey(tgFromId) // KEYS[1]
  )

  multi.dropUsersIndex(
    usersIndexKey(), // KEYS[1]
    userId // ARGV[1]
  )

  multi.dropSubscriptionLink(
    userActiveSubscriptionLinkKey(userId) // KEYS[1]
  )

  await multi.exec()
}

const parseModel = (result: unknown, message: string): UserCache | undefined => {
  if (result === null) {
    return undefined
  }

  const hash = parseHash(result, 9, message)

  return {
    id: parseNumber(hash[0], message),
    tgFromId: parseString(hash[1], message),
    activeSubscriptionId: parseNumber(hash[2], message),
    subscriptions: parseNumber(hash[3], message),
    categories: parseNumber(hash[4], message),
    bots: parseNumber(hash[5], message),
    createdAt: parseNumber(hash[6], message),
    updatedAt: parseNumber(hash[7], message),
    queuedAt: parseNumber(hash[8], message)
  }
}

const parseCollection = (result: unknown, message: string): UserCache[] => {
  const collection: UserCache[] = []

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
