import { Queue, Job, Worker, Processor } from 'bullmq'

export const HEARTBEAT_QUEUE_NAME = `heartbeat`
export const HEARTBEAT_REPEAT_EVERY = 10_000

export type HeartbeatConfig = {
  HEARTBEAT_CONCURRENCY: number
  HEARTBEAT_LIMITER_MAX: number
  HEARTBEAT_LIMITER_DURATION: number
  HEARTBEAT_FILLING_TREATMENT: number
  HEARTBEAT_PRODUCE_USERS: number
  HEARTBEAT_PRODUCE_PLANS: number
  HEARTBEAT_PRODUCE_SUBSCRIPTIONS: number
  HEARTBEAT_PRODUCE_BOTS: number
  HEARTBEAT_PRODUCE_CATEGORIES: number
  HEARTBEAT_PRODUCE_PROXIES: number
}

export type HeartbeatName = 'default'

export const HEARTBEAT_STEPS = [
  'users',
  'plans',
  'subscriptions',
  'bots',
  'categories',
  'proxies',
  'complete'
]
export type HeartbeatStep = (typeof HEARTBEAT_STEPS)[number]

export type HeartbeatData = {
  step: HeartbeatStep
}

export type HeartbeatStepResult = {
  entities: number
  durationTime: number
}
export type HeartbeatResult = Record<HeartbeatStep, HeartbeatStepResult>

export type HeartbeatQueue = Queue<HeartbeatData, HeartbeatResult, HeartbeatName>
export type HeartbeatJob = Job<HeartbeatData, HeartbeatResult, HeartbeatName>
export type HeartbeatWorker = Worker<HeartbeatData, HeartbeatResult, HeartbeatName>
export type HeartbeatProcessor = Processor<HeartbeatData, HeartbeatResult, HeartbeatName>
