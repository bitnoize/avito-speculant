import { Queue, Job, Worker, Processor } from 'bullmq'

export const CHECKPROXY_QUEUE_NAME = `checkproxy`

export const DEFAULT_CHECKPROXY_CONCURRENCY = 10
export const DEFAULT_CHECKPROXY_LIMITER_MAX = 10
export const DEFAULT_CHECKPROXY_LIMITER_DURATION = 1_000
export const DEFAULT_CHECKPROXY_REQUEST_URL = 'https://www.avito.ru/company'
export const DEFAULT_CHECKPROXY_REQUEST_TIMEOUT = 10_000
export const DEFAULT_CHECKPROXY_REQUEST_VERBOSE = false

export type CheckproxyConfig = {
  CHECKPROXY_CONCURRENCY: number
  CHECKPROXY_LIMITER_MAX: number
  CHECKPROXY_LIMITER_DURATION: number
  CHECKPROXY_REQUEST_URL: string
  CHECKPROXY_REQUEST_TIMEOUT: number
  CHECKPROXY_REQUEST_VERBOSE: boolean
}

export type CheckproxyName = 'default'

export type CheckproxyData = {
  proxyId: number
}

export type CheckproxyResult = {
  success: boolean
  statusCode: number
  sizeBytes: number
  durationTime: number
  curlDurationTime: number
}

export type CheckproxyQueue = Queue<CheckproxyData, CheckproxyResult, CheckproxyName>
export type CheckproxyJob = Job<CheckproxyData, CheckproxyResult, CheckproxyName>
export type CheckproxyWorker = Worker<CheckproxyData, CheckproxyResult, CheckproxyName>
export type CheckproxyProcessor = Processor<CheckproxyData, CheckproxyResult, CheckproxyName>
