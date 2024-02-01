import { RedisOptions, Redis } from 'ioredis'
import { Config } from '../config.js'
import { Logger } from '../logger.js'

/**
 * Get RedisOptions from config
 */
export function getRedisOptions(config: Config): RedisOptions {
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
export function initRedis(
  options: RedisOptions,
  logger: Logger
): Redis {
  const redis = new Redis(options)

  logger.debug(`Redis successfully initialized`)

  return redis
}
