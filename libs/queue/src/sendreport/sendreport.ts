import { Queue, Job, Worker, Processor } from 'bullmq'

export const SENDREPORT_QUEUE_NAME = `sendreport`
export const SENDREPORT_ATTEMPTS_LIMIT = 3

export type SendreportConfig = {
  SENDREPORT_CONCURRENCY: number
  SENDREPORT_LIMITER_MAX: number
  SENDREPORT_LIMITER_DURATION: number
}

export type SendreportName = 'default'

export type SendreportData = {
  categoryId: number
  advertId: number
}

export type SendreportResult = {
  durationTime: number
}

export type SendreportQueue = Queue<SendreportData, SendreportResult, SendreportName>
export type SendreportJob = Job<SendreportData, SendreportResult, SendreportName>
export type SendreportWorker = Worker<SendreportData, SendreportResult, SendreportName>
export type SendreportProcessor = Processor<SendreportData, SendreportResult, SendreportName>
