import { Queue, Job, Worker, Processor } from 'bullmq'

export const HEARTBEAT_QUEUE_NAME = `heartbeat`

export const DEFAULT_HEARTBEAT_CONCURRENCY = 1
export const DEFAULT_HEARTBEAT_LIMITER_MAX = 1
export const DEFAULT_HEARTBEAT_LIMITER_DURATION = 1_000

export type HeartbeatConfig = {
  HEARTBEAT_CONCURRENCY: number
  HEARTBEAT_LIMITER_MAX: number
  HEARTBEAT_LIMITER_DURATION: number
}

export const HEARTBEAT_STEPS = [
  'queue-users',
  'queue-plans',
  'queue-subscriptions',
  'queue-categories',
  'queue-proxies',
  'check-scrapers',
  'check-reporters',
  'complete'
]
export type HeartbeatStep = (typeof HEARTBEAT_STEPS)[number]

export type HeartbeatData = {
  step: HeartbeatStep
}

export type HeartbeatQueue = Queue<HeartbeatData, void>
export type HeartbeatJob = Job<HeartbeatData, void>
export type HeartbeatWorker = Worker<HeartbeatData, void>
export type HeartbeatProcessor = Processor<HeartbeatData, void>
