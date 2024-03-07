export const REDIS_CACHE_PREFIX = 'cache'
export const DEFAULT_CACHE_TIMEOUT = 24 * 3600 * 100

export type RedisConfig = {
  REDIS_HOST: string
  REDIS_PORT: number
  REDIS_DATABASE: number
  REDIS_USERNAME?: string
  REDIS_PASSWORD?: string
}
