import { Queue, Job, Worker, Processor } from 'bullmq'

export const DEFAULT_SCRAPER_CONCURRENCY = 10
export const DEFAULT_SCRAPER_LIMITER_MAX = 10
export const DEFAULT_SCRAPER_LIMITER_DURATION = 1_000

export const SCRAPER_QUEUE_NAME = `scraper`

export type ScraperConfig = {
  SCRAPER_CONCURRENCY?: number
  SCRAPER_LIMITER_MAX?: number
  SCRAPER_LIMITER_DURATION?: number
}

export type ScraperData = {
  scraperJobId: string
}

export type ScraperQueue = Queue<ScraperData, void>
export type ScraperJob = Job<ScraperData, void>
export type ScraperWorker = Worker<ScraperData, void>
export type ScraperProcessor = Processor<ScraperData, void>
