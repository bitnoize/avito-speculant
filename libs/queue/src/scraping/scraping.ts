import { Queue, Job, Worker, Processor } from 'bullmq'

export const SCRAPING_QUEUE_NAME = `scraping`

export const DEFAULT_SCRAPING_CONCURRENCY = 10
export const DEFAULT_SCRAPING_LIMITER_MAX = 10
export const DEFAULT_SCRAPING_LIMITER_DURATION = 1_000
export const DEFAULT_SCRAPING_REQUEST_VERBOSE = false

export type ScrapingConfig = {
  SCRAPING_CONCURRENCY: number
  SCRAPING_LIMITER_MAX: number
  SCRAPING_LIMITER_DURATION: number
  SCRAPING_REQUEST_VERBOSE: boolean
}

export type ScrapingName = 'default'

export type ScrapingData = {
  scraperId: string
}

export type ScrapingNameResult = {
  success: boolean
  statusCode: number
  sizeBytes: number
  durationTime: number
  requestTime: number
  parsingTime: number
}
export type ScrapingResult = Partial<Record<ScrapingName, ScrapingNameResult>>

export type ScrapingQueue = Queue<ScrapingData, ScrapingResult, ScrapingName>
export type ScrapingJob = Job<ScrapingData, ScrapingResult, ScrapingName>
export type ScrapingWorker = Worker<ScrapingData, ScrapingResult, ScrapingName>
export type ScrapingProcessor = Processor<ScrapingData, ScrapingResult, ScrapingName>
