import { Queue, Job, Worker, Processor } from 'bullmq'

export const SENDREPORT_QUEUE_NAME = `sendreport`

export const DEFAULT_SENDREPORT_CONCURRENCY = 10
export const DEFAULT_SENDREPORT_LIMITER_MAX = 10
export const DEFAULT_SENDREPORT_LIMITER_DURATION = 1_000
export const DEFAULT_SENDREPORT_ATTEMPTS_LIMIT = 3

export type SendreportConfig = {
  SENDREPORT_CONCURRENCY: number
  SENDREPORT_LIMITER_MAX: number
  SENDREPORT_LIMITER_DURATION: number
  SENDREPORT_ATTEMPTS_LIMIT: number
  BOT_TOKEN: string
}

export type SendreportName = 'default'

export type SendreportData = {
  reportId: string
}

export type SendreportNameResult = {
  durationTime: number
}
export type SendreportResult = Partial<Record<SendreportName, SendreportNameResult>>

export type SendreportQueue = Queue<SendreportData, SendreportResult, SendreportName>
export type SendreportJob = Job<SendreportData, SendreportResult, SendreportName>
export type SendreportWorker = Worker<SendreportData, SendreportResult, SendreportName>
export type SendreportProcessor = Processor<SendreportData, SendreportResult, SendreportName>
