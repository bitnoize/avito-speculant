import { Redis } from 'ioredis'
import { UserCache, userCacheKey, usersCacheKey } from './user-cache.js'
import { REDIS_CACHE_TIMEOUT } from '../redis.js'
import { parseNumber, parseManyNumbers, parseString } from '../redis.utils.js'

export const fetchUserCacheLua = `
if redis.call('EXISTS', KEYS[1]) == 0 then
  return redis.error_reply('ERR message ' .. KEYS[1] .. ' lost')
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

  return parseModel(result)
}

export const fetchUsersCacheIndexLua = `
return redis.call('SMEMBERS', KEYS[1])
`

export async function fetchIndex(redis: Redis): Promise<number[]> {
  const results = await redis.fetchUsersCacheIndex(
    usersCacheKey() // KEYS[1]
  )

  return parseManyNumbers(results)
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

  const results = await pipeline.exec()

  return parseCollection(results)
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

const parseModel = (result: unknown): UserCache => {
  if (!(Array.isArray(result) && result.length === 2)) {
    throw new TypeError(`Redis malformed result`)
  }

  return {
    id: parseNumber(result[0]),
    tgFromId: parseString(result[1])
  }
}

const parseCollection = (results: unknown): UserCache[] => {
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
