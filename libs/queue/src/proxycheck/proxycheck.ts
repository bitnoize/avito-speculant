import { Queue, Job, Worker, Processor } from 'bullmq'

export const PROXYCHECK_QUEUE_NAME = `proxycheck`

export type ProxycheckConfig = {
  PROXYCHECK_CONCURRENCY: number
  PROXYCHECK_LIMITER_MAX: number
  PROXYCHECK_LIMITER_DURATION: number
}

export type ProxycheckData = {
  proxyId: number
}

export type ProxycheckResult = void

export type ProxycheckQueue = Queue<ProxycheckData, ProxycheckResult>
export type ProxycheckJob = Job<ProxycheckData, ProxycheckResult>
export type ProxycheckWorker = Worker<ProxycheckData, ProxycheckResult>
export type ProxycheckProcessor = Processor<ProxycheckData, ProxycheckResult>
