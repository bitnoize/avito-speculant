import { Queue, Job, Worker, Processor } from 'bullmq'

export const CHECKBOT_QUEUE_NAME = `checkbot`

export const DEFAULT_CHECKBOT_CONCURRENCY = 10
export const DEFAULT_CHECKBOT_LIMITER_MAX = 10
export const DEFAULT_CHECKBOT_LIMITER_DURATION = 1_000
export const DEFAULT_CHECKBOT_PLACEHOLDER_URL = './misc/bot/placeholder.png'

export type CheckbotConfig = {
  CHECKBOT_CONCURRENCY: number
  CHECKBOT_LIMITER_MAX: number
  CHECKBOT_LIMITER_DURATION: number
  CHECKBOT_PLACEHOLDER_URL: string
}

export type CheckbotName = 'default'

export type CheckbotData = {
  botId: number
}

export type CheckbotNameResult = {
  success: boolean
  durationTime: number
}
export type CheckbotResult = Partial<Record<CheckbotName, CheckbotNameResult>>

export type CheckbotQueue = Queue<CheckbotData, CheckbotResult, CheckbotName>
export type CheckbotJob = Job<CheckbotData, CheckbotResult, CheckbotName>
export type CheckbotWorker = Worker<CheckbotData, CheckbotResult, CheckbotName>
export type CheckbotProcessor = Processor<CheckbotData, CheckbotResult, CheckbotName>
