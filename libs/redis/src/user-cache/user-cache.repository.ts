import { Redis } from 'ioredis'
import { UserCache, userKey, usersKey } from './user-cache.js'
import {
  parseNumber,
  parseManyNumbers,
  parseString,
  parseHash,
  parsePipeline,
  parseCommand
} from '../redis.utils.js'

export async function fetchUserCache(redis: Redis, userId: number): Promise<UserCache> {
  const result = await redis.fetchUserCache(
    userKey(userId) // KEYS[1]
  )

  return parseModel(result, `UserCache fetchUserCache malformed result`)
}

export async function fetchUsers(redis: Redis): Promise<number[]> {
  const result = await redis.fetchUsers(
    usersKey() // KEYS[1]
  )

  return parseManyNumbers(result, `UserCache fetchUsers malformed result`)
}

export async function fetchUsersCache(redis: Redis, userIds: number[]): Promise<UserCache[]> {
  if (userIds.length === 0) {
    return []
  }

  const pipeline = redis.pipeline()

  userIds.forEach((userId) => {
    pipeline.fetchUserCache(
      userKey(userId) // KEYS[1]
    )
  })

  const result = await pipeline.exec()

  return parseCollection(result, `UserCache fetchUsersCache malformed result`)
}

export async function saveUserCache(
  redis: Redis,
  userId: number,
  tgFromId: string,
  checkpointAt: number
): Promise<void> {
  await redis.saveUserCache(
    userKey(userId), // KEYS[1]
    usersKey(), // KEYS[2]
    userId, // ARGV[1]
    tgFromId, // ARGV[2]
    checkpointAt, // ARGV[3]
    Date.now() // ARGV[4]
  )
}

export async function dropUserCache(redis: Redis, userId: number): Promise<void> {
  await redis.dropUserCache(
    userKey(userId), // KEYS[1]
    usersKey(), // KEYS[2]
    userId // ARGV[1]
  )
}

export async function renewUserCache(
  redis: Redis,
  userId: number,
  checkpointAt: number
): Promise<void> {
  await redis.renewUserCache(
    userKey(userId), // KEYS[1]
    checkpointAt, // ARGV[1]
    Date.now() // ARGV[2]
  )
}

const parseModel = (result: unknown, message: string): UserCache => {
  const hash = parseHash(result, 4, message)

  return {
    id: parseNumber(hash[0], message),
    tgFromId: parseString(hash[1], message),
    checkpointAt: parseNumber(hash[2], message),
    time: parseNumber(hash[3], message)
  }
}

const parseCollection = (result: unknown, message: string): UserCache[] => {
  const pipeline = parsePipeline(result, message)

  return pipeline.map((pl) => {
    const command = parseCommand(pl, message)
    return parseModel(command, message)
  })
}
