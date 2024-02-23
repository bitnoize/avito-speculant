export interface Config {
  LOG_LEVEL: string
  REDIS_HOST: string
  REDIS_PORT: number
  REDIS_DATABASE: number
  REDIS_USERNAME?: string
  REDIS_PASSWORD?: string
  POSTGRES_HOST: string
  POSTGRES_PORT: number
  POSTGRES_DATABASE: string
  POSTGRES_USERNAME?: string
  POSTGRES_PASSWORD?: string
  HEARTBEAT_CONCURRENCY: number
  HEARTBEAT_LIMITER_MAX: number
  HEARTBEAT_LIMITER_DURATION: number
}
