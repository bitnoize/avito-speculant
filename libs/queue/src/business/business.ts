import { Queue, Job, Worker, Processor } from 'bullmq'

export const BUSINESS_QUEUE_NAME = `business`

export const DEFAULT_BUSINESS_CONCURRENCY = 2
export const DEFAULT_BUSINESS_LIMITER_MAX = 2
export const DEFAULT_BUSINESS_LIMITER_DURATION = 1_000

export type BusinessConfig = {
  BUSINESS_CONCURRENCY: number
  BUSINESS_LIMITER_MAX: number
  BUSINESS_LIMITER_DURATION: number
}

export type BusinessData = {
  id: number
}

export type BusinessQueue = Queue<BusinessData, void>
export type BusinessJob = Job<BusinessData, void>
export type BusinessWorker = Worker<BusinessData, void>
export type BusinessProcessor = Processor<BusinessData, void>
