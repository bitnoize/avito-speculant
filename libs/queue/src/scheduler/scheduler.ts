import { Queue, Job, Worker, Processor } from 'bullmq'

export const SCHEDULER_QUEUE_NAME = `scheduler`

export type SchedulerConfig = {
  SCHEDULER_CONCURRENCY: number
  SCHEDULER_LIMITER_MAX: number
  SCHEDULER_LIMITER_DURATION: number
}

export type SchedulerData = void

export type SchedulerResult = {
  counter: number
}

export type SchedulerQueue = Queue<SchedulerData, SchedulerResult>
export type SchedulerJob = Job<SchedulerData, SchedulerResult>
export type SchedulerWorker = Worker<SchedulerData, SchedulerResult>
export type SchedulerProcessor = Processor<SchedulerData, SchedulerResult>
