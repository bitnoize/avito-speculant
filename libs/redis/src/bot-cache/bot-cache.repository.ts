import { Redis } from 'ioredis'
import { BotCache, botCacheKey, botsIndexKey, onlineBotsIndexKey } from './proxy-cache.js'
import {
  parseNumber,
  parseManyNumbers,
  parseString,
  parseHash,
  parsePipeline,
  parseCommand
} from '../redis.utils.js'

export async function fetchBotCache(
  redis: Redis,
  proxyId: number
): Promise<BotCache | undefined> {
  const result = await redis.fetchBotCache(
    botCacheKey(proxyId) // KEYS[1]
  )

  return parseModel(result, `fetchBotCache malformed result`)
}

export async function fetchBotsIndex(redis: Redis): Promise<number[]> {
  const result = await redis.fetchBotsIndex(
    botsIndexKey() // KEYS[1]
  )

  return parseManyNumbers(result, `fetchBots malformed result`)
}

export async function fetchOnlineBotsIndex(redis: Redis): Promise<number[]> {
  const result = await redis.fetchBotsIndex(
    onlineBotsIndexKey() // KEYS[1]
  )

  return parseManyNumbers(result, `fetchOnlineBots malformed result`)
}

export async function fetchRandomOnlineBot(redis: Redis): Promise<number | undefined> {
  const result = await redis.fetchRandomBot(
    onlineBotsIndexKey() // KEYS[1]
  )

  if (result == null) {
    return undefined
  }

  return parseNumber(result, `fetchRandomOnlineBot malformed result`)
}

export async function fetchBotsCache(redis: Redis, proxyIds: number[]): Promise<BotCache[]> {
  if (proxyIds.length === 0) {
    return []
  }

  const pipeline = redis.pipeline()

  proxyIds.forEach((proxyId) => {
    pipeline.fetchBotCache(
      botCacheKey(proxyId) // KEYS[1]
    )
  })

  const result = await pipeline.exec()

  return parseCollection(result, `fetchBotsCache malformed result`)
}

export async function saveEnabledBotCache(
  redis: Redis,
  proxyId: number,
  proxyUrl: string,
  proxyIsEnabled: boolean,
  proxyCreatedAt: number,
  proxyUpdatedAt: number,
  proxyQueuedAt: number,
): Promise<void> {
  await redis.saveBotCache(
    botCacheKey(proxyId), // KEYS[1]
    botsIndexKey(), // KEYS[2]
    proxyId, // ARGV[1]
    proxyUrl, // ARGV[2]
    proxyIsEnabled, // ARGV[3]
    proxyCreatedAt, // ARGV[4]
    proxyUpdatedAt, // ARGV[5]
    proxyQueuedAt // ARGV[6]
  )
}

export async function renewOnlineBotCache(
  redis: Redis,
  proxyId: number,
  sizeBytes: number
): Promise<void> {
  await redis.renewOnlineBotCache(
    botCacheKey(proxyId), // KEYS[1]
    onlineBotsIndexKey(), // KEYS[2]
    proxyId, // ARGV[1]
    sizeBytes, // ARGV[2]
    Date.now() // ARGV[3]
  )
}

export async function renewOfflineBotCache(
  redis: Redis,
  proxyId: number,
  sizeBytes: number
): Promise<void> {
  await redis.renewOfflineBotCache(
    botCacheKey(proxyId), // KEYS[1]
    onlineBotsIndexKey(), // KEYS[2]
    proxyId, // ARGV[1]
    sizeBytes, // ARGV[2]
    Date.now() // ARGV[3]
  )
}

const parseModel = (result: unknown, message: string): BotCache | undefined => {
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

const parseCollection = (result: unknown, message: string): BotCache[] => {
  const pipeline = parsePipeline(result, message)

  return pipeline
    .map((pl) => {
      const command = parseCommand(pl, message)
      return parseModel(command, message)
    })
    .filter((proxy) => proxy !== undefined)
}
