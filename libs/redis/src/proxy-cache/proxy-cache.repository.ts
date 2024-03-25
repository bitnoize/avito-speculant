import { Redis } from 'ioredis'
import { ProxyCache, proxyCacheKey, proxiesCacheKey, proxiesCacheOnlineKey } from './proxy-cache.js'
import { REDIS_CACHE_TIMEOUT } from '../redis.js'
import {
  parseNumber,
  parseManyNumbers,
  parseString,
  parseHash,
  parsePipeline,
  parseCommand
} from '../redis.utils.js'

export const fetchProxyCacheLua = `
if redis.call('EXISTS', KEYS[1]) == 0 then
  return nil 
end

local proxy_cache = redis.call(
  'HMGET', KEYS[1],
  'id',
  'proxy_url',
  'is_online',
  'total_count',
  'success_count',
  'size_bytes'
)

return {
  unpack(proxy_cache)
}
`

export async function fetchModel(redis: Redis, proxyId: number): Promise<ProxyCache> {
  const result = await redis.fetchProxyCache(
    proxyCacheKey(proxyId) // KEYS[1]
  )

  return parseModel(result, `ProxyCache fetchModel malformed result`)
}

export const fetchProxiesCacheIndexLua = `
return redis.call('SMEMBERS', KEYS[1])
`

export async function fetchIndex(redis: Redis): Promise<number[]> {
  const result = await redis.fetchProxiesCacheIndex(
    proxiesCacheKey() // KEYS[1]
  )

  return parseManyNumbers(result, `ProxyCache fetchIndex malformed result`)
}

export async function fetchOnlineIndex(redis: Redis): Promise<number[]> {
  const result = await redis.fetchProxiesCacheIndex(
    proxiesCacheOnlineKey() // KEYS[1]
  )

  return parseManyNumbers(result, `ProxyCache fetchOnlineIndex malformed result`)
}

export const randomProxyCacheIndexLua = `
return redis.call('SRANDMEMBER', KEYS[1])
`

export async function randomOnlineIndex(redis: Redis): Promise<number | undefined> {
  const result = await redis.randomProxyCacheIndex(
    proxiesCacheOnlineKey() // KEYS[1]
  )

  if (result == null) {
    return undefined
  }

  return parseNumber(result, `ProxyCache randomOnlineIndex malformed result`)
}

export async function fetchCollection(redis: Redis, proxyIds: number[]): Promise<ProxyCache[]> {
  if (proxyIds.length === 0) {
    return []
  }

  const pipeline = redis.pipeline()

  proxyIds.forEach((proxyId) => {
    pipeline.fetchProxyCache(
      proxyCacheKey(proxyId) // KEYS[1]
    )
  })

  const result = await pipeline.exec()

  return parseCollection(result, `ProxyCache fetchCollection malformed result`)
}

export const saveProxyCacheLua = `
redis.call('HSET', KEYS[1], 'id', ARGV[1], 'proxy_url', ARGV[2])
redis.call('HSETNX', KEYS[1], 'is_online', 0)
redis.call('HSETNX', KEYS[1], 'total_count', 0)
redis.call('HSETNX', KEYS[1], 'success_count', 0)
redis.call('HSETNX', KEYS[1], 'size_bytes', 0)
redis.call('PEXPIRE', KEYS[1], ARGV[3])

redis.call('SADD', KEYS[2], ARGV[1])
redis.call('PEXPIRE', KEYS[2], ARGV[3])

return redis.status_reply('OK')
`

export async function saveModel(redis: Redis, proxyId: number, proxyUrl: string): Promise<void> {
  await redis.saveProxyCache(
    proxyCacheKey(proxyId), // KEYS[1]
    proxiesCacheKey(), // KEYS[2]
    proxyId, // ARGV[1]
    proxyUrl, // ARGV[2]
    REDIS_CACHE_TIMEOUT // ARGV[3]
  )
}

export const dropProxyCacheLua = `
redis.call('DEL', KEYS[1])

redis.call('SREM', KEYS[2], ARGV[1])
redis.call('PEXPIRE', KEYS[2], ARGV[2])

redis.call('SREM', KEYS[3], ARGV[1])
redis.call('PEXPIRE', KEYS[3], ARGV[2])

return redis.status_reply('OK')
`

export async function dropModel(redis: Redis, proxyId: number): Promise<void> {
  await redis.dropProxyCache(
    proxyCacheKey(proxyId), // KEYS[1]
    proxiesCacheKey(), // KEYS[2]
    proxiesCacheOnlineKey(), // KEYS[3]
    proxyId, // ARGV[1]
    REDIS_CACHE_TIMEOUT // ARGV[2]
  )
}

export const renewProxyCacheOnlineLua = `
if redis.call('EXISTS', KEYS[1]) == 0 then
  return redis.status_reply('OK')
end

redis.call('HSET', KEYS[1], 'is_online', 1)
redis.call('HINCRBY', KEYS[1], 'total_count', 1)
redis.call('HINCRBY', KEYS[1], 'success_count', 1)
redis.call('HINCRBY', KEYS[1], 'size_bytes', ARGV[2])
redis.call('PEXPIRE', KEYS[1], ARGV[3])

redis.call('SADD', KEYS[2], ARGV[1])
redis.call('PEXPIRE', KEYS[2], ARGV[3])

return redis.status_reply('OK')
`

export async function renewOnline(
  redis: Redis,
  proxyId: number,
  sizeBytes: number
): Promise<void> {
  await redis.renewProxyCacheOnline(
    proxyCacheKey(proxyId), // KEYS[1]
    proxiesCacheOnlineKey(), // KEYS[2]
    proxyId, // ARGV[1]
    sizeBytes, // ARGV[2]
    REDIS_CACHE_TIMEOUT // ARGV[3]
  )
}

export const renewProxyCacheOfflineLua = `
if redis.call('EXISTS', KEYS[1]) == 0 then
  return redis.status_reply('OK')
end

redis.call('HSET', KEYS[1], 'is_online', 0)
redis.call('HINCRBY', KEYS[1], 'total_count', 1)
redis.call('HINCRBY', KEYS[1], 'size_bytes', ARGV[2])
redis.call('PEXPIRE', KEYS[1], ARGV[3])

redis.call('SREM', KEYS[2], ARGV[1])
redis.call('PEXPIRE', KEYS[2], ARGV[3])

return redis.status_reply('OK')
`

export async function renewOffline(
  redis: Redis,
  proxyId: number,
  sizeBytes: number
): Promise<void> {
  await redis.renewProxyCacheOffline(
    proxyCacheKey(proxyId), // KEYS[1]
    proxiesCacheOnlineKey(), // KEYS[2]
    proxyId, // ARGV[1]
    sizeBytes, // ARGV[2]
    REDIS_CACHE_TIMEOUT // ARGV[3]
  )
}

const parseModel = (result: unknown, message: string): ProxyCache => {
  const hash = parseHash(result, 6, message)

  return {
    id: parseNumber(hash[0], message),
    proxyUrl: parseString(hash[1], message),
    isOnline: !!parseNumber(hash[2], message),
    totalCount: parseNumber(hash[3], message),
    successCount: parseNumber(hash[4], message),
    sizeBytes: parseNumber(hash[5], message)
  }
}

const parseCollection = (result: unknown, message: string): ProxyCache[] => {
  const pipeline = parsePipeline(result, message)

  return pipeline.map((pl) => {
    const command = parseCommand(pl, message)
    return parseModel(command, message)
  })
}
