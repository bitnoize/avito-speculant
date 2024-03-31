import { Redis } from 'ioredis'
import { ProxyCache, proxyKey, proxiesKey, onlineProxiesKey } from './proxy-cache.js'
import {
  parseNumber,
  parseManyNumbers,
  parseString,
  parseHash,
  parsePipeline,
  parseCommand
} from '../redis.utils.js'

export async function fetchProxyCache(redis: Redis, proxyId: number): Promise<ProxyCache> {
  const result = await redis.fetchProxyCache(
    proxyKey(proxyId) // KEYS[1]
  )

  return parseModel(result, `ProxyCache fetchProxyCache malformed result`)
}

export async function fetchProxies(redis: Redis): Promise<number[]> {
  const result = await redis.fetchProxies(
    proxiesKey() // KEYS[1]
  )

  return parseManyNumbers(result, `ProxyCache fetchProxies malformed result`)
}

export async function fetchOnlineProxies(redis: Redis): Promise<number[]> {
  const result = await redis.fetchProxies(
    onlineProxiesKey() // KEYS[1]
  )

  return parseManyNumbers(result, `ProxyCache fetchOnlineProxies malformed result`)
}

export async function fetchRandomOnlineProxy(redis: Redis): Promise<number | undefined> {
  const result = await redis.fetchRandomProxy(
    onlineProxiesKey() // KEYS[1]
  )

  if (result == null) {
    return undefined
  }

  return parseNumber(result, `ProxyCache fetchRandomOnlineProxy malformed result`)
}

export async function fetchProxiesCache(redis: Redis, proxyIds: number[]): Promise<ProxyCache[]> {
  if (proxyIds.length === 0) {
    return []
  }

  const pipeline = redis.pipeline()

  proxyIds.forEach((proxyId) => {
    pipeline.fetchProxyCache(
      proxyKey(proxyId) // KEYS[1]
    )
  })

  const result = await pipeline.exec()

  return parseCollection(result, `ProxyCache fetchProxiesCache malformed result`)
}

export async function saveProxyCache(
  redis: Redis,
  proxyId: number,
  proxyUrl: string
): Promise<void> {
  await redis.saveProxyCache(
    proxyKey(proxyId), // KEYS[1]
    proxiesKey(), // KEYS[2]
    proxyId, // ARGV[1]
    proxyUrl, // ARGV[2]
    Date.now() // ARGV[3]
  )
}

export async function dropProxyCache(redis: Redis, proxyId: number): Promise<void> {
  await redis.dropProxyCache(
    proxyKey(proxyId), // KEYS[1]
    proxiesKey(), // KEYS[2]
    onlineProxiesKey(), // KEYS[3]
    proxyId // ARGV[1]
  )
}

export async function renewOnlineProxyCache(
  redis: Redis,
  proxyId: number,
  sizeBytes: number
): Promise<void> {
  await redis.renewOnlineProxyCache(
    proxyKey(proxyId), // KEYS[1]
    onlineProxiesKey(), // KEYS[2]
    proxyId, // ARGV[1]
    sizeBytes, // ARGV[2]
    Date.now() // ARGV[3]
  )
}

export async function renewOfflineProxyCache(
  redis: Redis,
  proxyId: number,
  sizeBytes: number
): Promise<void> {
  await redis.renewOfflineProxyCache(
    proxyKey(proxyId), // KEYS[1]
    onlineProxiesKey(), // KEYS[2]
    proxyId, // ARGV[1]
    sizeBytes, // ARGV[2]
    Date.now() // ARGV[3]
  )
}

const parseModel = (result: unknown, message: string): ProxyCache => {
  const hash = parseHash(result, 7, message)

  return {
    id: parseNumber(hash[0], message),
    proxyUrl: parseString(hash[1], message),
    isOnline: !!parseNumber(hash[2], message),
    totalCount: parseNumber(hash[3], message),
    successCount: parseNumber(hash[4], message),
    sizeBytes: parseNumber(hash[5], message),
    time: parseNumber(hash[6], message)
  }
}

const parseCollection = (result: unknown, message: string): ProxyCache[] => {
  const pipeline = parsePipeline(result, message)

  return pipeline.map((pl) => {
    const command = parseCommand(pl, message)
    return parseModel(command, message)
  })
}
