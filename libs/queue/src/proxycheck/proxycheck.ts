import { Queue, Job, Worker, Processor } from 'bullmq'

export const PROXYCHECK_QUEUE_NAME = `proxycheck`

export const DEFAULT_PROXYCHECK_CONCURRENCY = 2
export const DEFAULT_PROXYCHECK_LIMITER_MAX = 2
export const DEFAULT_PROXYCHECK_LIMITER_DURATION = 1_000

export type ProxycheckConfig = {
  PROXYCHECK_CONCURRENCY?: number
  PROXYCHECK_LIMITER_MAX?: number
  PROXYCHECK_LIMITER_DURATION?: number
}

export type ProxycheckData = {
  proxyId: number
}

export type ProxycheckQueue = Queue<ProxycheckData, void>
export type ProxycheckJob = Job<ProxycheckData, void>
export type ProxycheckWorker = Worker<ProxycheckData, void>
export type ProxycheckProcessor = Processor<ProxycheckData, void>
