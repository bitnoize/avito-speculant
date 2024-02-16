import { RedisOptions, Redis } from 'ioredis'
import { Logger } from '@avito-speculant/logger'
import { Notify } from '@avito-speculant/domain'
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

  logger.debug(`Redis successfully initialized`)

  return redis
}

/*
 * Close Redis instance
 */
export async function closeRedis(redis: Redis, logger: Logger): Promise<void> {
  await redis.disconnect()

  logger.debug(`Redis successfully closed`)
}

/**
 * Initialize PubSub instance
 */
export function initPubSub(options: RedisOptions, logger: Logger): Redis {
  const pubSub = new Redis(options)

  pubSub.on('connect', () => {
    logger.debug(`PubSub successfully connected`)
  })

  logger.debug(`PubSub successfully initialized`)

  return pubSub
}

/*
 * Publish PubSub BackLog
 */
export async function publishBackLog(
  pubSub: Redis,
  logger: Logger,
  backLog: Notify[]
): Promise<void> {
  for (const notify of backLog) {
    await pubSub.publish(...notify)
  
    logger.debug(notify, `PubSub BackLog published`)
  }
}

/*
 * Close PubSub instance
 */
export async function closePubSub(pubSub: Redis, logger: Logger): Promise<void> {
  await pubSub.disconnect()

  logger.debug(`PubSub successfully closed`)
}
