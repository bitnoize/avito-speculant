import { Queue, Job, Worker, Processor } from 'bullmq'

export const BROADCAST_QUEUE_NAME = `broadcast`

export const DEFAULT_BROADCAST_CONCURRENCY = 10
export const DEFAULT_BROADCAST_LIMITER_MAX = 10
export const DEFAULT_BROADCAST_LIMITER_DURATION = 1_000

export type BroadcastConfig = {
  BROADCAST_CONCURRENCY: number
  BROADCAST_LIMITER_MAX: number
  BROADCAST_LIMITER_DURATION: number
}

export type BroadcastName = 'default'

export type BroadcastData = {
  userId: number
}

export type BroadcastNameResult = {
  durationTime: number
}
export type BroadcastResult = Record<string, BroadcastNameResult>

export type BroadcastQueue = Queue<BroadcastData, BroadcastResult, BroadcastName>
export type BroadcastJob = Job<BroadcastData, BroadcastResult, BroadcastName>
export type BroadcastWorker = Worker<BroadcastData, BroadcastResult, BroadcastName>
export type BroadcastProcessor = Processor<BroadcastData, BroadcastResult, BroadcastName>
