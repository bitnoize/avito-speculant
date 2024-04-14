import { Queue, Job, Worker, Processor } from 'bullmq'

export const THROTTLE_QUEUE_NAME = `throttle`
export const THROTTLE_REPEAT_EVERY = 1_000

export const DEFAULT_THROTTLE_CONCURRENCY = 1
export const DEFAULT_THROTTLE_LIMITER_MAX = 1
export const DEFAULT_THROTTLE_LIMITER_DURATION = 1_000
export const DEFAULT_THROTTLE_REPORTS_LIMIT = 30

export type ThrottleConfig = {
  THROTTLE_CONCURRENCY: number
  THROTTLE_LIMITER_MAX: number
  THROTTLE_LIMITER_DURATION: number
  THROTTLE_REPORTS_LIMIT: number
}

export type ThrottleName = 'default'

export type ThrottleData = undefined

export type ThrottleNameResult = {
  durationTime: number
}
export type ThrottleResult = Partial<Record<ThrottleName, ThrottleNameResult>>

export type ThrottleQueue = Queue<ThrottleData, ThrottleResult, ThrottleName>
export type ThrottleJob = Job<ThrottleData, ThrottleResult, ThrottleName>
export type ThrottleWorker = Worker<ThrottleData, ThrottleResult, ThrottleName>
export type ThrottleProcessor = Processor<ThrottleData, ThrottleResult, ThrottleName>
