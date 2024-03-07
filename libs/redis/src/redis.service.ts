import { RedisOptions, Redis } from 'ioredis'
import { Logger } from '@avito-speculant/logger'
import { Notify } from '@avito-speculant/notify'
import * as systemRepository from './system/system.repository.js'
import * as userCacheRepository from './user-cache/user-cache.repository.js'
import * as planCacheRepository from './plan-cache/plan-cache.repository.js'
import * as subscriptionCacheRepository from './subscription-cache/subscription-cache.repository.js'
import * as categoryCacheRepository from './category-cache/category-cache.repository.js'
import * as proxyCacheRepository from './proxy-cache/proxy-cache.repository.js'
import * as scraperCacheRepository from './scraper-cache/scraper-cache.repository.js'
import { RedisConfig } from './redis.js'

/**
 * Get RedisOptions from config
 */
export function getRedisOptions<T extends RedisConfig>(config: T): RedisOptions {
  const redisOptions: RedisOptions = {
    host: config.REDIS_HOST,
    port: config.REDIS_PORT,
    db: config.REDIS_DATABASE,
    username: config.REDIS_USERNAME,
    password: config.REDIS_PASSWORD
  }

  return redisOptions
}

/**
 * Initialize Redis instance
 */
export function initRedis(options: RedisOptions, logger: Logger): Redis {
  const redis = new Redis(options)

  //
  // System
  //

  redis.on('connect', () => {
    logger.debug(`Redis successfully connected`)
  })

  //
  // UserCache
  //

  redis.defineCommand('fetchUserCache', {
    numberOfKeys: 1,
    lua: userCacheRepository.fetchUserCacheLua
  })

  redis.defineCommand('saveUserCache', {
    numberOfKeys: 2,
    lua: userCacheRepository.saveUserCacheLua
  })

  redis.defineCommand('dropUserCache', {
    numberOfKeys: 2,
    lua: userCacheRepository.dropUserCacheLua
  })

  redis.defineCommand('fetchUsersCacheIndex', {
    numberOfKeys: 1,
    lua: userCacheRepository.fetchUsersCacheIndexLua
  })

  //
  // PlanCache
  //

  redis.defineCommand('fetchPlanCache', {
    numberOfKeys: 1,
    lua: planCacheRepository.fetchPlanCacheLua
  })

  redis.defineCommand('savePlanCache', {
    numberOfKeys: 2,
    lua: planCacheRepository.savePlanCacheLua
  })

  redis.defineCommand('dropPlanCache', {
    numberOfKeys: 2,
    lua: planCacheRepository.dropPlanCacheLua
  })

  redis.defineCommand('fetchPlansCacheIndex', {
    numberOfKeys: 1,
    lua: planCacheRepository.fetchPlansCacheIndexLua
  })

  //
  // SubscriptionCache
  //

  redis.defineCommand('fetchSubscriptionCache', {
    numberOfKeys: 1,
    lua: subscriptionCacheRepository.fetchSubscriptionCacheLua
  })

  redis.defineCommand('saveSubscriptionCache', {
    numberOfKeys: 3,
    lua: subscriptionCacheRepository.saveSubscriptionCacheLua
  })

  redis.defineCommand('dropSubscriptionCache', {
    numberOfKeys: 3,
    lua: subscriptionCacheRepository.dropSubscriptionCacheLua
  })

  redis.defineCommand('fetchUserSubscriptionCacheIndex', {
    numberOfKeys: 1,
    lua: subscriptionCacheRepository.fetchUserSubscriptionCacheIndexLua
  })

  redis.defineCommand('fetchPlanSubscriptionsCacheIndex', {
    numberOfKeys: 1,
    lua: subscriptionCacheRepository.fetchPlanSubscriptionsCacheIndexLua
  })

  //
  // CategoryCache
  //

  redis.defineCommand('fetchCategoryCache', {
    numberOfKeys: 1,
    lua: categoryCacheRepository.fetchCategoryCacheLua
  })

  redis.defineCommand('saveCategoryCache', {
    numberOfKeys: 3,
    lua: categoryCacheRepository.saveCategoryCacheLua
  })

  redis.defineCommand('dropCategoryCache', {
    numberOfKeys: 3,
    lua: categoryCacheRepository.dropCategoryCacheLua
  })

  redis.defineCommand('fetchUserCategoriesCacheIndex', {
    numberOfKeys: 1,
    lua: categoryCacheRepository.fetchUserCategoriesCacheIndexLua
  })

  redis.defineCommand('fetchScraperCategoriesCacheIndex', {
    numberOfKeys: 1,
    lua: categoryCacheRepository.fetchScraperCategoriesCacheIndexLua
  })

  //
  // ProxyCache
  //

  redis.defineCommand('fetchProxyCache', {
    numberOfKeys: 1,
    lua: proxyCacheRepository.fetchProxyCacheLua
  })

  redis.defineCommand('saveProxyCache', {
    numberOfKeys: 3,
    lua: proxyCacheRepository.saveProxyCacheLua
  })

  redis.defineCommand('dropProxyCache', {
    numberOfKeys: 3,
    lua: proxyCacheRepository.dropProxyCacheLua
  })

  redis.defineCommand('fetchProxiesCacheIndex', {
    numberOfKeys: 1,
    lua: proxyCacheRepository.fetchProxiesCacheIndexLua
  })

  //
  // ScraperCache
  //

  redis.defineCommand('fetchScraperCache', {
    numberOfKeys: 1,
    lua: scraperCacheRepository.fetchScraperCacheLua
  })

  redis.defineCommand('saveScraperCache', {
    numberOfKeys: 2,
    lua: scraperCacheRepository.saveScraperCacheLua
  })

  redis.defineCommand('dropScraperCache', {
    numberOfKeys: 2,
    lua: scraperCacheRepository.dropScraperCacheLua
  })

  redis.defineCommand('fetchScrapersCacheIndex', {
    numberOfKeys: 1,
    lua: scraperCacheRepository.fetchScrapersCacheIndexLua
  })

  return redis
}

/**
 * Close Redis connection
 */
export async function closeRedis(redis: Redis): Promise<void> {
  await redis.disconnect()
}

/**
 * Initialize PubSub instance
 */
export function initPubSub(options: RedisOptions, logger: Logger): Redis {
  const pubSub = new Redis(options)

  pubSub.on('connect', () => {
    logger.debug(`PubSub successfully connected`)
  })

  return pubSub
}

/*
 * PubSub publish BackLog
 */
export async function publishBackLog(pubSub: Redis, backLog: Notify[]): Promise<void> {
  for (const notify of backLog) {
    const [channel, logId, id, action] = notify
    await pubSub.publish(channel, `${logId}\t${id}\t${action}`)
  }
}

/**
 * Close PubSub connection
 */
export async function closePubSub(pubSub: Redis): Promise<void> {
  await pubSub.disconnect()
}
