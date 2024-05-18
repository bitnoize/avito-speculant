import { Redis } from 'ioredis'

export const REDIS_CACHE_PREFIX = 'cache'

export type RedisConfig = {
  REDIS_HOST: string
  REDIS_PORT: number
  REDIS_DATABASE: number
  REDIS_USERNAME: string
  REDIS_PASSWORD?: string
}

export type InitScripts = (redis: Redis) => void

export type RedisMethod<Request, Response> = (redis: Redis, request: Request) => Promise<Response>
