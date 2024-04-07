import { v4 as uuidv4 } from 'uuid'
import { RedisOptions, Redis } from 'ioredis'
import { Logger } from '@avito-speculant/logger'
import { Notify } from '@avito-speculant/common'
import initUserCacheScripts from './user-cache/user-cache.scripts.js'
import initPlanCacheScripts from './plan-cache/plan-cache.scripts.js'
import initSubscriptionCacheScripts from './subscription-cache/subscription-cache.scripts.js'
import initCategoryCacheScripts from './category-cache/category-cache.scripts.js'
import initProxyCacheScripts from './proxy-cache/proxy-cache.scripts.js'
import initScraperCacheScripts from './scraper-cache/scraper-cache.scripts.js'
import initAdvertCacheScripts from './advert-cache/advert-cache.scripts.js'
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

  redis.on('connect', () => {
    logger.debug(`Redis successfully connected`)
  })

  initUserCacheScripts(redis)
  initPlanCacheScripts(redis)
  initSubscriptionCacheScripts(redis)
  initCategoryCacheScripts(redis)
  initProxyCacheScripts(redis)
  initScraperCacheScripts(redis)
  initAdvertCacheScripts(redis)

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
    const [entityName, logId, entityId, action] = notify
    await pubSub.publish(entityName, [logId, entityId, action].join(`\t`))
  }
}

/**
 * Close PubSub connection
 */
export async function closePubSub(pubSub: Redis): Promise<void> {
  await pubSub.disconnect()
}

export const randomHash = (): string => uuidv4().replaceAll('-', '')
