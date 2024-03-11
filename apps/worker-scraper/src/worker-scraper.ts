export interface Config {
  LOG_LEVEL: string
  REDIS_HOST: string
  REDIS_PORT: number
  REDIS_DATABASE: number
  REDIS_USERNAME?: string
  REDIS_PASSWORD?: string
  SCRAPER_CONCURRENCY: number
  SCRAPER_LIMITER_MAX: number
  SCRAPER_LIMITER_DURATION: number
}
