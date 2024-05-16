import { Redis } from 'ioredis'
import { BotCache, botCacheKey, userBotsIndexKey } from './bot-cache.js'
import {
  parseNumber,
  parseManyNumbers,
  parseString,
  parseStringOrNull,
  parseHash,
  parsePipeline,
  parseCommand
} from '../redis.utils.js'

export async function fetchBotCache(redis: Redis, botId: number): Promise<BotCache | undefined> {
  const result = await redis.fetchBotCache(
    botCacheKey(botId) // KEYS[1]
  )

  return parseModel(result, `fetchBotCache malformed result`)
}

export async function fetchUserBotsIndex(redis: Redis, userId: number): Promise<number[]> {
  const result = await redis.fetchBotsIndex(
    userBotsIndexKey(userId) // KEYS[1]
  )

  return parseManyNumbers(result, `fetchUserBotsIndex malformed result`)
}

export async function fetchBotsCache(redis: Redis, botIds: number[]): Promise<BotCache[]> {
  if (botIds.length === 0) {
    return []
  }

  const pipeline = redis.pipeline()

  botIds.forEach((botId) => {
    pipeline.fetchBotCache(
      botCacheKey(botId) // KEYS[1]
    )
  })

  const result = await pipeline.exec()

  return parseCollection(result, `fetchBotsCache malformed result`)
}

export async function saveBotCache(
  redis: Redis,
  botId: number,
  userId: number,
  token: string,
  isLinked: boolean,
  isEnabled: boolean,
  createdAt: number,
  updatedAt: number,
  queuedAt: number
): Promise<void> {
  const multi = redis.multi()

  multi.saveBotCache(
    botCacheKey(botId), // KEYS[1]
    botId, // ARGV[1]
    userId, // ARGV[2]
    token, // ARGV[3]
    isLinked ? 1 : 0, // ARGV[4]
    isEnabled ? 1 : 0, // ARGV[5]
    createdAt, // ARGV[6]
    updatedAt, // ARGV[7]
    queuedAt // ARGV[8]
  )

  multi.saveBotsIndex(
    userBotsIndexKey(userId), // KEYS[1]
    botId, // ARGV[1]
    createdAt // ARGV[2]
  )

  await multi.exec()
}

export async function saveOnlineBotCache(
  redis: Redis,
  botId: number,
  tgFromId: string,
  username: string
): Promise<void> {
  const multi = redis.multi()

  multi.saveOnlineBotCache(
    botCacheKey(botId), // KEYS[1]
    tgFromId, // ARGV[1]
    username // ARGV[2]
  )

  await multi.exec()
}

export async function saveOfflineBotCache(redis: Redis, botId: number): Promise<void> {
  const multi = redis.multi()

  multi.saveOfflineBotCache(
    botCacheKey(botId) // KEYS[1]
  )

  await multi.exec()
}

export async function dropBotCache(redis: Redis, botId: number, userId: number): Promise<void> {
  const multi = redis.multi()

  multi.dropBotCache(
    botCacheKey(botId) // KEYS[1]
  )

  multi.dropBotsIndex(
    userBotsIndexKey(userId), // KEYS[1]
    botId // ARGV[1]
  )

  await multi.exec()
}

const parseModel = (result: unknown, message: string): BotCache | undefined => {
  if (result === null) {
    return undefined
  }

  const hash = parseHash(result, 13, message)

  return {
    id: parseNumber(hash[0], message),
    userId: parseNumber(hash[1], message),
    token: parseString(hash[2], message),
    isLinked: !!parseNumber(hash[3], message),
    isEnabled: !!parseNumber(hash[4], message),
    isOnline: !!parseNumber(hash[5], message),
    tgFromId: parseStringOrNull(hash[6], message),
    username: parseStringOrNull(hash[7], message),
    totalCount: parseNumber(hash[8], message),
    successCount: parseNumber(hash[9], message),
    createdAt: parseNumber(hash[10], message),
    updatedAt: parseNumber(hash[11], message),
    queuedAt: parseNumber(hash[12], message)
  }
}

const parseCollection = (result: unknown, message: string): BotCache[] => {
  const collection: BotCache[] = []

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
