import { Queue, Job, Worker, Processor } from 'bullmq'

export const CHECKBOT_QUEUE_NAME = 'checkbot'

export type CheckbotConfig = {
  CHECKBOT_CONCURRENCY: number
  CHECKBOT_LIMITER_MAX: number
  CHECKBOT_LIMITER_DURATION: number
}

export type CheckbotName = 'default'

export type CheckbotData = {
  botId: number
}

export type CheckbotResult = {
  success: boolean
  testingTime: number
  durationTime: number
}

export type CheckbotQueue = Queue<CheckbotData, CheckbotResult, CheckbotName>
export type CheckbotJob = Job<CheckbotData, CheckbotResult, CheckbotName>
export type CheckbotWorker = Worker<CheckbotData, CheckbotResult, CheckbotName>
export type CheckbotProcessor = Processor<CheckbotData, CheckbotResult, CheckbotName>
