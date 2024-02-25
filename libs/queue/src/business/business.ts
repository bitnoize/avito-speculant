import { Queue, Job, Worker, Processor } from 'bullmq'

export const BUSINESS_QUEUE_NAME = `business`

export type BusinessConfig = {
  BUSINESS_CONCURRENCY: number
  BUSINESS_LIMITER_MAX: number
  BUSINESS_LIMITER_DURATION: number
}

export type BusinessData = {
  id: number
}

export type BusinessResult = void

export type BusinessQueue = Queue<BusinessData, BusinessResult>
export type BusinessJob = Job<BusinessData, BusinessResult>
export type BusinessWorker = Worker<BusinessData, BusinessResult>
export type BusinessProcessor = Processor<BusinessData, BusinessResult>
