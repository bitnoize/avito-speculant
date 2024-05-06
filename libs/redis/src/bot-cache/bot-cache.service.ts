import {
  FetchBotCache,
  FetchBotsCache,
  FetchOnlineBotsCache,
  FetchRandomOnlineBotCache,
  SaveBotCache,
  DropBotCache,
  RenewOnlineBotCache,
  RenewOfflineBotCache
} from './dto/index.js'
import * as botCacheRepository from './bot-cache.repository.js'

/*
 * Fetch BotCache
 */
export const fetchBotCache: FetchBotCache = async function (redis, request) {
  const botCache = await botCacheRepository.fetchBotCache(redis, request.botId)

  return { botCache }
}

/*
 * Fetch BotsCache
 */
export const fetchBotsCache: FetchBotsCache = async function (redis) {
  const botIds = await botCacheRepository.fetchBots(redis)
  const botsCache = await botCacheRepository.fetchBotsCache(redis, botIds)

  return { botsCache }
}

/*
 * Fetch Online BotsCache
 */
export const fetchOnlineBotsCache: FetchOnlineBotsCache = async function (redis) {
  const botIds = await botCacheRepository.fetchOnlineBots(redis)
  const botsCache = await botCacheRepository.fetchBotsCache(redis, botIds)

  return { botsCache }
}

/*
 * Fetch Random Online BotCache
 */
export const fetchRandomOnlineBotCache: FetchRandomOnlineBotCache = async function (redis) {
  const botId = await botCacheRepository.fetchRandomOnlineBot(redis)

  if (botId === undefined) {
    return {
      botCache: undefined
    }
  }

  const botCache = await botCacheRepository.fetchBotCache(redis, botId)

  return { botCache }
}

/*
 * Save BotCache
 */
export const saveBotCache: SaveBotCache = async function (redis, request) {
  await botCacheRepository.saveBotCache(redis, request.botId, request.botUrl)
}

/*
 * Drop BotCache
 */
export const dropBotCache: DropBotCache = async function (redis, request) {
  await botCacheRepository.dropBotCache(redis, request.botId)
}

/*
 * Renew Online BotCache
 */
export const renewOnlineBotCache: RenewOnlineBotCache = async function (redis, request) {
  await botCacheRepository.renewOnlineBotCache(redis, request.botId, request.sizeBytes)
}

/*
 * Renew Offline BotCache
 */
export const renewOfflineBotCache: RenewOfflineBotCache = async function (redis, request) {
  await botCacheRepository.renewOfflineBotCache(redis, request.botId, request.sizeBytes)
}
