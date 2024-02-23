import { Queue, Job, Worker, Processor } from 'bullmq'

export const SCRAPER_QUEUE_NAME = `scraper`

export type ScraperConfig = {
  SCRAPER_CONCURRENCY: number
  SCRAPER_LIMITER_MAX: number
  SCRAPER_LIMITER_DURATION: number
}

export type ScraperData = void

export type ScraperResult = void

export type ScraperQueue = Queue<ScraperData, ScraperResult>
export type ScraperJob = Job<ScraperData, ScraperResult>
export type ScraperWorker = Worker<ScraperData, ScraperResult>
export type ScraperProcessor = Processor<ScraperData, ScraperResult>
