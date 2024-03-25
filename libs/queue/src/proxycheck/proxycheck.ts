import { Queue, Job, Worker, Processor } from 'bullmq'

export const PROXYCHECK_QUEUE_NAME = `proxycheck`

export const DEFAULT_PROXYCHECK_CONCURRENCY = 2
export const DEFAULT_PROXYCHECK_LIMITER_MAX = 2
export const DEFAULT_PROXYCHECK_LIMITER_DURATION = 1_000
export const DEFAULT_PROXYCHECK_CHECK_URL = 'https://www.avito.ru/company'
export const DEFAULT_PROXYCHECK_CHECK_TIMEOUT = 1_000

export type ProxycheckConfig = {
  PROXYCHECK_CONCURRENCY: number
  PROXYCHECK_LIMITER_MAX: number
  PROXYCHECK_LIMITER_DURATION: number
  PROXYCHECK_CHECK_URL: string
  PROXYCHECK_CHECK_TIMEOUT: number
}

export type ProxycheckName = 'curl-impersonate'

export type ProxycheckData = {
  proxyId: number
}

export type ProxycheckNameResult = {
  proxyId: number
  statusCode: number
  isOnline: boolean
}
export type ProxycheckResult = Record<string, ProxycheckNameResult>

export type ProxycheckQueue = Queue<ProxycheckData, ProxycheckResult, ProxycheckName>
export type ProxycheckJob = Job<ProxycheckData, ProxycheckResult, ProxycheckName>
export type ProxycheckWorker = Worker<ProxycheckData, ProxycheckResult, ProxycheckName>
export type ProxycheckProcessor = Processor<ProxycheckData, ProxycheckResult, ProxycheckName>
