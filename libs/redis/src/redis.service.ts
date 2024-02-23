import { RedisOptions, Redis } from 'ioredis'
import { Logger } from '@avito-speculant/logger'
import { Notify } from '@avito-speculant/domain'
import * as systemLua from './system/system.lua.js'
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

  redis.defineCommand('acquireHeartbeatLock', {
    numberOfKeys: 1,
    lua: systemLua.acquireHeartbeatLock
  })

  redis.defineCommand('renewalHeartbeatLock', {
    numberOfKeys: 1,
    lua: systemLua.renewalHeartbeatLock
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
 * Publish BackLog
 */
export async function publishBackLog(
  pubSub: Redis,
  logger: Logger,
  backLog: Notify[]
): Promise<void> {
  for (const notify of backLog) {
    const [channel, logId, modelId, action] = notify
    await pubSub.publish(channel, `${logId}\t${modelId}\t${action}`)

    logger.debug({ channel, logId, modelId, action }, `Publish BackLog Notify`)
  }
}

/*
 * Close PubSub instance
 */
export async function closePubSub(pubSub: Redis, logger: Logger): Promise<void> {
  await pubSub.disconnect()

  logger.debug(`PubSub successfully closed`)
}
