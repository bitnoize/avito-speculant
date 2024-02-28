import { RedisOptions, Redis } from 'ioredis'
import { Logger } from '@avito-speculant/logger'
import { Notify } from '@avito-speculant/domain'
import * as systemRepository from './system/system.repository.js'
import * as cacheRepository from './cache/cache.repository.js'
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

  redis.defineCommand('getScraperJobs', {
    numberOfKeys: 1,
    lua: cacheRepository.getScraperJobsLua
  })

  redis.defineCommand('getScraperJobById', {
    numberOfKeys: 1,
    lua: cacheRepository.getScraperJobByIdLua
  })

  return redis
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
 * Publish BackLog
 */
export async function publishBackLog(
  pubSub: Redis,
  backLog: Notify[],
  logger: Logger,
): Promise<void> {
  for (const notify of backLog) {
    const [channel, logId, modelId, action] = notify
    await pubSub.publish(channel, `${logId}\t${modelId}\t${action}`)

    logger.debug({ channel, logId, modelId, action }, `Publish BackLog Notify`)
  }
}
