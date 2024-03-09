export const DEFAULT_REDIS_HOST = 'localhost'
export const DEFAULT_REDIS_PORT = 6379
export const DEFAULT_REDIS_DATABASE = 0

export const REDIS_CACHE_PREFIX = 'cache'
export const REDIS_CACHE_TIMEOUT = 24 * 3600 * 1000

export type RedisConfig = {
  REDIS_HOST: string
  REDIS_PORT: number
  REDIS_DATABASE: number
  REDIS_USERNAME?: string
  REDIS_PASSWORD?: string
}
