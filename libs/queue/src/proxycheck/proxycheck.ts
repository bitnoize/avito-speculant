import { Queue, Job, Worker, Processor } from 'bullmq'

export const PROXYCHECK_QUEUE_NAME = `proxycheck`

export const DEFAULT_PROXYCHECK_CONCURRENCY = 10
export const DEFAULT_PROXYCHECK_LIMITER_MAX = 10
export const DEFAULT_PROXYCHECK_LIMITER_DURATION = 1_000
export const DEFAULT_PROXYCHECK_REQUEST_URL = 'https://www.avito.ru/company'
export const DEFAULT_PROXYCHECK_REQUEST_TIMEOUT = 10_000
export const DEFAULT_PROXYCHECK_REQUEST_VERBOSE = false

export type ProxycheckConfig = {
  PROXYCHECK_CONCURRENCY: number
  PROXYCHECK_LIMITER_MAX: number
  PROXYCHECK_LIMITER_DURATION: number
  PROXYCHECK_REQUEST_URL: string
  PROXYCHECK_REQUEST_TIMEOUT: number
  PROXYCHECK_REQUEST_VERBOSE: boolean
}

export type ProxycheckName = 'default'

export type ProxycheckData = {
  proxyId: number
}

export type ProxycheckNameResult = {
  success: boolean
  statusCode: number
  sizeBytes: number
  durationTime: number
  curlDurationTime: number
}
export type ProxycheckResult = Partial<Record<ProxycheckName, ProxycheckNameResult>>

export type ProxycheckQueue = Queue<ProxycheckData, ProxycheckResult, ProxycheckName>
export type ProxycheckJob = Job<ProxycheckData, ProxycheckResult, ProxycheckName>
export type ProxycheckWorker = Worker<ProxycheckData, ProxycheckResult, ProxycheckName>
export type ProxycheckProcessor = Processor<ProxycheckData, ProxycheckResult, ProxycheckName>
