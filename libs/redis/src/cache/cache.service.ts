import { Redis } from 'ioredis'
import { Logger } from '@avito-speculant/logger'
import { User } from '@avito-speculant/domain'

export async function storeUser(
  redis: Redis,
  user: User,
  logger: Logger,
): Promise<void> {
  await redis.cacheStoreUser(
    cacheUserKey(user.id),
    user.id,
    user.tgFromId,
    user.status,
    user.subscriptions,
    user.categories,
    user.createdAt,
    user.updatedAt,
    user.queuedAt
  )
}

export async function fetchUser(
  redis: Redis,
  userId: number,
  force: boolean,
  logger: Logger,
): Promise<User> {
  const result = await this.redis.cacheFetchUser(
    cacheUserKey(user.id) // KEYS[1]
  )

  if (!(Array.isArray(result) && result.length === 9)) {
    throw new TypeError(`Redis cacheFetchUser malformed result`)
  }

  const id = parseNumber(result[0])
  const tgFromId = parseString(result[1])
  const status = parseUserStatus(result[2])
  const subscriptions = parseNumber(result[3])
  const categories = parseNumber(result[4])
  const createdAt = parseNumber(result[5])
  const updatedAt = parseNumber(result[6])
  const queuedAt = parseNumber(result[7])
  const isDirty = parseBoolean(result[8])

  if (isDirty && !force) {
    return undefined
  }

  return {
    id,
    tgFromId,
    status,
    subscriptions,
    categories,
    createdAt,
    updatedAt,
    queuedAt
  }
}

const cacheUserKey = (userId: number) => ['cache', 'user', userId].join(':')
