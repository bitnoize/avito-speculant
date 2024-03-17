import { Queue, Job, Worker, Processor } from 'bullmq'

export const HEARTBEAT_QUEUE_NAME = `heartbeat`

export const DEFAULT_HEARTBEAT_CONCURRENCY = 1
export const DEFAULT_HEARTBEAT_LIMITER_MAX = 1
export const DEFAULT_HEARTBEAT_LIMITER_DURATION = 1_000
export const DEFAULT_HEARTBEAT_PRODUCE_USERS_LIMIT = 10
export const DEFAULT_HEARTBEAT_PRODUCE_PLANS_LIMIT = 1
export const DEFAULT_HEARTBEAT_PRODUCE_SUBSCRIPTIONS_LIMIT = 10
export const DEFAULT_HEARTBEAT_PRODUCE_CATEGORIES_LIMIT = 10
export const DEFAULT_HEARTBEAT_PRODUCE_PROXIES_LIMIT = 10

export type HeartbeatConfig = {
  HEARTBEAT_CONCURRENCY: number
  HEARTBEAT_LIMITER_MAX: number
  HEARTBEAT_LIMITER_DURATION: number
  HEARTBEAT_PRODUCE_USERS_LIMIT: number
  HEARTBEAT_PRODUCE_PLANS_LIMIT: number
  HEARTBEAT_PRODUCE_SUBSCRIPTIONS_LIMIT: number
  HEARTBEAT_PRODUCE_CATEGORIES_LIMIT: number
  HEARTBEAT_PRODUCE_PROXIES_LIMIT: number
}

export const HEARTBEAT_STEPS = [
  'produce-users',
  'produce-plans',
  'produce-subscriptions',
  'produce-categories',
  'produce-proxies',
  'check-scrapers',
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
