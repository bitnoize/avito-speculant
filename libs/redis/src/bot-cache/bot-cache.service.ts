import {
  FetchBotCache,
  FetchUserBotsCache,
  SaveBotCache,
  SaveOnlineBotCache,
  SaveOfflineBotCache,
  DropBotCache,
} from './dto/index.js'
import { BotCacheNotFoundError } from './bot-cache.errors.js'
import * as botCacheRepository from './bot-cache.repository.js'

/*
 * Fetch BotCache
 */
export const fetchBotCache: FetchBotCache = async function (redis, request) {
  const botCache = await botCacheRepository.fetchBotCache(redis, request.botId)

  if (botCache === undefined) {
    throw new BotCacheNotFoundError({ request })
  }

  return { botCache }
}

/*
 * Fetch UserBotsCache
 */
export const fetchUserBotsCache: FetchUserBotsCache = async function (redis, request) {
  const botIds = await botCacheRepository.fetchUserBotsIndex(redis, request.userId)
  const botsCache = await botCacheRepository.fetchBotsCache(redis, botIds)

  return { botsCache }
}

/*
 * Save BotCache
 */
export const saveBotCache: SaveBotCache = async function (redis, request) {
  await botCacheRepository.saveBotCache(
    redis,
    request.botId,
    request.userId,
    request.token,
    request.isLinked,
    request.isEnabled,
    request.createdAt,
    request.updatedAt,
    request.queuedAt
  )
}

/*
 * Save Online BotCache
 */
export const saveOnlineBotCache: SaveOnlineBotCache = async function (redis, request) {
  await botCacheRepository.saveOnlineBotCache(redis, request.botId)
}

/*
 * Save Offline BotCache
 */
export const saveOfflineBotCache: SaveOfflineBotCache = async function (redis, request) {
  await botCacheRepository.saveOfflineBotCache(redis, request.botId)
}

/*
 * Drop BotCache
 */
export const dropBotCache: DropBotCache = async function (redis, request) {
  await botCacheRepository.dropBotCache(redis, request.botId, request.userId)
}
