export const SCRAPER_QUEUE_NAME = `scraper`

export type ScraperConfig = {
  SCRAPER_CONCURRENCY: number
  SCRAPER_LIMITER_MAX: number
  SCRAPER_LIMITER_DURATION: number
}

export type ScraperData = void

export type ScraperResult = void
