import { Queue, Job, Worker, Processor } from 'bullmq'

export const HEARTBEAT_QUEUE_NAME = `heartbeat`

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
  'wait-results',
  'check-scrapers',
  //'check-reporters',
  'complete'
]
export type HeartbeatStep = (typeof HEARTBEAT_STEPS)[number]

export type HeartbeatData = {
  step: HeartbeatStep
}

export type HeartbeatResult = void

export type HeartbeatQueue = Queue<HeartbeatData, HeartbeatResult>
export type HeartbeatJob = Job<HeartbeatData, HeartbeatResult>
export type HeartbeatWorker = Worker<HeartbeatData, HeartbeatResult>
export type HeartbeatProcessor = Processor<HeartbeatData, HeartbeatResult>
