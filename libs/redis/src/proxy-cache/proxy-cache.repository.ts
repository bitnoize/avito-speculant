import { Redis } from 'ioredis'
import {
  ProxyCache,
  proxyCacheKey,
  proxiesIndexKey,
  onlineProxiesIndexKey
} from './proxy-cache.js'
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
    proxyCacheKey(proxyId) // KEYS[1]
  )

  return parseModel(result, `fetchProxyCache malformed result`)
}

export async function fetchProxiesIndex(redis: Redis): Promise<number[]> {
  const result = await redis.fetchProxiesIndex(
    proxiesIndexKey() // KEYS[1]
  )

  return parseManyNumbers(result, `fetchProxiesIndex malformed result`)
}

export async function fetchOnlineProxiesIndex(redis: Redis): Promise<number[]> {
  const result = await redis.fetchProxiesIndex(
    onlineProxiesIndexKey() // KEYS[1]
  )

  return parseManyNumbers(result, `fetchOnlineProxiesIndex malformed result`)
}

export async function fetchRandomOnlineProxyLink(redis: Redis): Promise<number | undefined> {
  const result = await redis.fetchRandomProxyLink(
    onlineProxiesIndexKey() // KEYS[1]
  )

  if (result == null) {
    return undefined
  }

  return parseNumber(result, `fetchRandomOnlineProxyLink malformed result`)
}

export async function fetchProxiesCache(redis: Redis, proxyIds: number[]): Promise<ProxyCache[]> {
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

  return parseCollection(result, `fetchProxiesCache malformed result`)
}

export async function saveProxyCache(
  redis: Redis,
  proxyId: number,
  url: string,
  isEnabled: boolean,
  createdAt: number,
  updatedAt: number,
  queuedAt: number,
): Promise<void> {
  const multi = redis.multi()

  multi.saveProxyCache(
    proxyCacheKey(proxyId), // KEYS[1]
    proxyId, // ARGV[1]
    url, // ARGV[2]
    isEnabled ? 1 : 0, // ARGV[3]
    createdAt, // ARGV[4]
    updatedAt, // ARGV[5]
    queuedAt // ARGV[6]
  )

  multi.saveProxiesIndex(
    proxiesIndexKey(), // KEYS[1]
    proxyId, // ARGV[1]
    createdAt // ARGV[2]
  )

  await multi.exec()
}

export async function saveOnlineProxyCache(
  redis: Redis,
  proxyId: number,
  sizeBytes: number,
  createdAt: number
): Promise<void> {
  const multi = redis.multi()

  multi.saveOnlineProxyCache(
    proxyCacheKey(proxyId), // KEYS[1]
    sizeBytes // ARGV[1]
  )

  multi.saveProxiesIndex(
    onlineProxiesIndexKey(), // KEYS[1]
    proxyId, // ARGV[1]
    createdAt // ARGV[2]
  )

  await multi.exec()
}

export async function saveOfflineProxyCache(
  redis: Redis,
  proxyId: number,
  sizeBytes: number
): Promise<void> {
  const multi = redis.multi()

  multi.saveOfflineProxyCache(
    proxyCacheKey(proxyId), // KEYS[1]
    sizeBytes // ARGV[1]
  )

  multi.dropProxiesIndex(
    onlineProxiesIndexKey(), // KEYS[1]
    proxyId // ARGV[1]
  )

  await multi.exec()
}

export async function dropProxyCache(
  redis: Redis,
  proxyId: number,
): Promise<void> {
  const multi = redis.multi()

  multi.dropProxyCache(
    proxyCacheKey(proxyId) // KEYS[1]
  )

  multi.dropProxiesIndex(
    proxiesIndexKey(), // KEYS[1]
    proxyId // ARGV[1]
  )

  multi.dropProxiesIndex(
    onlineProxiesIndexKey(), // KEYS[1]
    proxyId // ARGV[1]
  )

  await multi.exec()
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
  const collection: ProxyCache[] = []

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
