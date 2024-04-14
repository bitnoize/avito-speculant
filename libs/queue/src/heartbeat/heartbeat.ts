import { Queue, Job, Worker, Processor } from 'bullmq'

export const HEARTBEAT_QUEUE_NAME = `heartbeat`
export const HEARTBEAT_REPEAT_EVERY = 10_000

export const DEFAULT_HEARTBEAT_CONCURRENCY = 1
export const DEFAULT_HEARTBEAT_LIMITER_MAX = 1
export const DEFAULT_HEARTBEAT_LIMITER_DURATION = 1_000
export const DEFAULT_HEARTBEAT_FILLING_TREATMENT_MAX = 100
export const DEFAULT_HEARTBEAT_PRODUCE_USERS_LIMIT = 10
export const DEFAULT_HEARTBEAT_PRODUCE_PLANS_LIMIT = 2
export const DEFAULT_HEARTBEAT_PRODUCE_SUBSCRIPTIONS_LIMIT = 10
export const DEFAULT_HEARTBEAT_PRODUCE_CATEGORIES_LIMIT = 10
export const DEFAULT_HEARTBEAT_PRODUCE_PROXIES_LIMIT = 10

export type HeartbeatConfig = {
  HEARTBEAT_CONCURRENCY: number
  HEARTBEAT_LIMITER_MAX: number
  HEARTBEAT_LIMITER_DURATION: number
  HEARTBEAT_FILLING_TREATMENT_MAX: number
  HEARTBEAT_PRODUCE_USERS_LIMIT: number
  HEARTBEAT_PRODUCE_PLANS_LIMIT: number
  HEARTBEAT_PRODUCE_SUBSCRIPTIONS_LIMIT: number
  HEARTBEAT_PRODUCE_CATEGORIES_LIMIT: number
  HEARTBEAT_PRODUCE_PROXIES_LIMIT: number
}

export type HeartbeatName = 'default'

export const HEARTBEAT_STEPS = [
  'users',
  'plans',
  'subscriptions',
  'categories',
  'proxies',
  'complete'
]
export type HeartbeatStep = (typeof HEARTBEAT_STEPS)[number]

export type HeartbeatData = {
  step: HeartbeatStep
}

export type HeartbeatStepResult = {
  produceCount: number
  durationTime: number
}
export type HeartbeatResult = Partial<Record<HeartbeatStep, HeartbeatStepResult>>

export type HeartbeatQueue = Queue<HeartbeatData, HeartbeatResult, HeartbeatName>
export type HeartbeatJob = Job<HeartbeatData, HeartbeatResult, HeartbeatName>
export type HeartbeatWorker = Worker<HeartbeatData, HeartbeatResult, HeartbeatName>
export type HeartbeatProcessor = Processor<HeartbeatData, HeartbeatResult, HeartbeatName>
