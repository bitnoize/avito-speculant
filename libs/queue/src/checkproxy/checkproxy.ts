import { Queue, Job, Worker, Processor } from 'bullmq'

export const CHECKPROXY_QUEUE_NAME = `checkproxy`
export const CHECKPROXY_TEST_URL = 'https://www.avito.ru/company'
export const CHECKPROXY_TEST_TIMEOUT = 10_000

export type CheckproxyConfig = {
  CHECKPROXY_CONCURRENCY: number
  CHECKPROXY_LIMITER_MAX: number
  CHECKPROXY_LIMITER_DURATION: number
}

export type CheckproxyName = 'default'

export type CheckproxyData = {
  proxyId: number
}

export type CheckproxyResult = {
  success: boolean
  statusCode: number
  testingTime: number
  durationTime: number
}

export type CheckproxyQueue = Queue<CheckproxyData, CheckproxyResult, CheckproxyName>
export type CheckproxyJob = Job<CheckproxyData, CheckproxyResult, CheckproxyName>
export type CheckproxyWorker = Worker<CheckproxyData, CheckproxyResult, CheckproxyName>
export type CheckproxyProcessor = Processor<CheckproxyData, CheckproxyResult, CheckproxyName>
