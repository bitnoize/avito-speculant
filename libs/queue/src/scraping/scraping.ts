import { Queue, Job, Worker, Processor } from 'bullmq'

export const SCRAPING_QUEUE_NAME = `scraping`
export const SCRAPING_REPEAT_EVERY = 5_000
export const SCRAPING_STEAL_TIMEOUT = 10_000

export type ScrapingConfig = {
  SCRAPING_CONCURRENCY: number
  SCRAPING_LIMITER_MAX: number
  SCRAPING_LIMITER_DURATION: number
}

export type ScrapingName = 'default'

export type ScrapingData = {
  scraperId: string
}

export type ScrapingResult = {
  success: boolean
  statusCode: number
  stealingTime: number
  parsingTime: number
  durationTime: number
}

export type ScrapingQueue = Queue<ScrapingData, ScrapingResult, ScrapingName>
export type ScrapingJob = Job<ScrapingData, ScrapingResult, ScrapingName>
export type ScrapingWorker = Worker<ScrapingData, ScrapingResult, ScrapingName>
export type ScrapingProcessor = Processor<ScrapingData, ScrapingResult, ScrapingName>
