import { Redis } from 'ioredis'
import { UserCache, userCacheKey, usersCacheKey } from './user-cache.js'
import { REDIS_CACHE_TIMEOUT } from '../redis.js'
import {
  parseNumber,
  parseManyNumbers,
  parseString,
  parseHash,
  parsePipeline,
  parseCommand
} from '../redis.utils.js'

export const fetchUserCacheLua = `
if redis.call('EXISTS', KEYS[1]) == 0 then
  return nil 
end

local user_cache = redis.call('HMGET', KEYS[1], 'id', 'tg_from_id')

return {
  unpack(user_cache)
}
`

export async function fetchModel(redis: Redis, userId: number): Promise<UserCache> {
  const result = await redis.fetchUserCache(
    userCacheKey(userId) // KEYS[1]
  )

  return parseModel(result, `UserCache fetchModel malformed result`)
}

export const fetchUsersCacheIndexLua = `
return redis.call('SMEMBERS', KEYS[1])
`

export async function fetchIndex(redis: Redis): Promise<number[]> {
  const result = await redis.fetchUsersCacheIndex(
    usersCacheKey() // KEYS[1]
  )

  return parseManyNumbers(result, `UserCache fetchIndex malformed result`)
}

export async function fetchCollection(redis: Redis, userIds: number[]): Promise<UserCache[]> {
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

  return parseCollection(result, `UserCache fetchCollection malformed result`)
}

export const saveUserCacheLua = `
redis.call('HSET', KEYS[1], 'id', ARGV[1], 'tg_from_id', ARGV[2])
redis.call('PEXPIRE', KEYS[1], ARGV[3])

redis.call('SADD', KEYS[2], ARGV[1])
redis.call('PEXPIRE', KEYS[2], ARGV[3])

return redis.status_reply('OK')
`

export async function saveModel(redis: Redis, userId: number, tgFromId: string): Promise<void> {
  await redis.saveUserCache(
    userCacheKey(userId), // KEYS[1]
    usersCacheKey(), // KEYS[2]
    userId, // ARGV[1]
    tgFromId, // ARGV[2]
    REDIS_CACHE_TIMEOUT // ARGV[3]
  )
}

export const dropUserCacheLua = `
redis.call('DEL', KEYS[1])

redis.call('SREM', KEYS[2], ARGV[1])
redis.call('PEXPIRE', KEYS[2], ARGV[2])

return redis.status_reply('OK')
`

export async function dropModel(redis: Redis, userId: number): Promise<void> {
  await redis.dropUserCache(
    userCacheKey(userId), // KEYS[1]
    usersCacheKey(), // KEYS[2]
    userId, // ARGV[1]
    REDIS_CACHE_TIMEOUT // ARGV[2]
  )
}

const parseModel = (result: unknown, message: string): UserCache => {
  const hash = parseHash(result, 2, message)

  return {
    id: parseNumber(hash[0], message),
    tgFromId: parseString(hash[1], message)
  }
}

const parseCollection = (result: unknown, message: string): UserCache[] => {
  const pipeline = parsePipeline(result, message)

  return pipeline.map((pl) => {
    const command = parseCommand(pl, message)
    return parseModel(command, message)
  })
}
