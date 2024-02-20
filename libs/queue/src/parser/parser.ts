import { Queue, Job, Worker, Processor } from 'bullmq'

export const PARSER_QUEUE_NAME = `parser`

export type ParserConfig = {
  PARSER_CONCURRENCY: number
  PARSER_LIMITER_MAX: number
  PARSER_LIMITER_DURATION: number
}

export type ParserData = {
  avitoUrl: string
}

export type ParserResult = {
  newAds: number
}

export type ParserQueue = Queue<ParserData, ParserResult>
export type ParserJob = Job<ParserData, ParserResult>
export type ParserWorker = Worker<ParserData, ParserResult>
export type ParserProcessor = Processor<ParserData, ParserResult>
