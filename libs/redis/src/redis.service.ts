import { RedisOptions, Redis } from 'ioredis'
import { Logger } from '@avito-speculant/logger'
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
