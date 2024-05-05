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

export async function fetchProxyCache(
  redis: Redis,
  proxyId: number
): Promise<ProxyCache | undefined> {
  const result = await redis.fetchProxyCache(
    proxyKey(proxyId) // KEYS[1]
  )

  return parseModel(result, `fetchProxyCache malformed result`)
}

export async function fetchProxiesIndex(redis: Redis): Promise<number[]> {
  const result = await redis.fetchProxiesIndex(
    proxiesKey() // KEYS[1]
  )

  return parseManyNumbers(result, `fetchProxies malformed result`)
}

export async function fetchOnlineProxiesIndex(redis: Redis): Promise<number[]> {
  const result = await redis.fetchProxiesIndex(
    onlineProxiesKey() // KEYS[1]
  )

  return parseManyNumbers(result, `fetchOnlineProxies malformed result`)
}

export async function fetchRandomOnlineProxy(redis: Redis): Promise<number | undefined> {
  const result = await redis.fetchRandomProxy(
    onlineProxiesKey() // KEYS[1]
  )

  if (result == null) {
    return undefined
  }

  return parseNumber(result, `fetchRandomOnlineProxy malformed result`)
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

  return parseCollection(result, `fetchProxiesCache malformed result`)
}

export async function saveEnabledProxyCache(
  redis: Redis,
  proxyId: number,
  proxyUrl: string,
  proxyIsEnabled: boolean,
  proxyCreatedAt: number,
  proxyUpdatedAt: number,
  proxyQueuedAt: number,
): Promise<void> {
  await redis.saveProxyCache(
    proxyKey(proxyId), // KEYS[1]
    proxiesKey(), // KEYS[2]
    proxyId, // ARGV[1]
    proxyUrl, // ARGV[2]
    proxyIsEnabled, // ARGV[3]
    proxyCreatedAt, // ARGV[4]
    proxyUpdatedAt, // ARGV[5]
    proxyQueuedAt // ARGV[6]
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

const parseModel = (result: unknown, message: string): ProxyCache | undefined => {
  if (result === null) {
    return undefined
  }

  const hash = parseHash(result, 10, message)

  return {
    id: parseNumber(hash[0], message),
    url: parseString(hash[1], message),
    isEnabled: !!parseNumber(hash[2], message),
    isOnline: !!parseNumber(hash[3], message),
    totalCount: parseNumber(hash[4], message),
    successCount: parseNumber(hash[5], message),
    sizeBytes: parseNumber(hash[6], message),
    createdAt: parseNumber(hash[7], message),
    updatedAt: parseNumber(hash[8], message),
    queuedAt: parseNumber(hash[9], message),
  }
}

const parseCollection = (result: unknown, message: string): ProxyCache[] => {
  const pipeline = parsePipeline(result, message)

  return pipeline
    .map((pl) => {
      const command = parseCommand(pl, message)
      return parseModel(command, message)
    })
    .filter((proxy) => proxy !== undefined)
}
