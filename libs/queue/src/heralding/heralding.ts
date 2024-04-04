import { Queue, Job, Worker, Processor } from 'bullmq'

export const HERALDING_QUEUE_NAME = `heralding`

export const DEFAULT_HERALDING_CONCURRENCY = 10
export const DEFAULT_HERALDING_LIMITER_MAX = 10
export const DEFAULT_HERALDING_LIMITER_DURATION = 1_000

export type HeraldingConfig = {
  HERALDING_CONCURRENCY: number
  HERALDING_LIMITER_MAX: number
  HERALDING_LIMITER_DURATION: number
}

export type HeraldingName = 'default'

export type HeraldingData = {
  userId: number
}

export type HeraldingNameResult = {
  userId: number
  durationTime: number
}
export type HeraldingResult = Record<string, HeraldingNameResult>

export type HeraldingQueue = Queue<HeraldingData, HeraldingResult, HeraldingName>
export type HeraldingJob = Job<HeraldingData, HeraldingResult, HeraldingName>
export type HeraldingWorker = Worker<HeraldingData, HeraldingResult, HeraldingName>
export type HeraldingProcessor = Processor<HeraldingData, HeraldingResult, HeraldingName>
