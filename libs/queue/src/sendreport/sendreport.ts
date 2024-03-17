import { Queue, Job, Worker, Processor } from 'bullmq'

export const SENDREPORT_QUEUE_NAME = `sendreport`

export const DEFAULT_SENDREPORT_CONCURRENCY = 2
export const DEFAULT_SENDREPORT_LIMITER_MAX = 2
export const DEFAULT_SENDREPORT_LIMITER_DURATION = 1_000

export type SendreportConfig = {
  SENDREPORT_CONCURRENCY: number
  SENDREPORT_LIMITER_MAX: number
  SENDREPORT_LIMITER_DURATION: number
  BOT_TOKEN: string
}

export type SendreportData = {
  userId: number
  categoryId: number
}

export type SendreportQueue = Queue<SendreportData, void>
export type SendreportJob = Job<SendreportData, void>
export type SendreportWorker = Worker<SendreportData, void>
export type SendreportProcessor = Processor<SendreportData, void>
