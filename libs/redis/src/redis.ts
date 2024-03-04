export const REDIS_CACHE_PREFIX = 'cache'

export type RedisConfig = {
  REDIS_HOST: string
  REDIS_PORT: number
  REDIS_DATABASE: number
  REDIS_USERNAME?: string
  REDIS_PASSWORD?: string
}

export const CHANNELS = ['user', 'plan', 'subscription', 'category']
export type Channel = (typeof CHANNELS)[number]

export type Notify = [Channel, string, number, string]
