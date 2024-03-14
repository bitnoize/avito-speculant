import { Queue, Job, Worker, Processor } from 'bullmq'

export const TREATMENT_QUEUE_NAME = `business`

export const DEFAULT_TREATMENT_CONCURRENCY = 2
export const DEFAULT_TREATMENT_LIMITER_MAX = 2
export const DEFAULT_TREATMENT_LIMITER_DURATION = 1_000

export type TreatmentConfig = {
  TREATMENT_CONCURRENCY?: number
  TREATMENT_LIMITER_MAX?: number
  TREATMENT_LIMITER_DURATION?: number
}

export type TreatmentData = {
  entityId: number
}

export type TreatmentQueue = Queue<TreatmentData, void>
export type TreatmentJob = Job<TreatmentData, void>
export type TreatmentWorker = Worker<TreatmentData, void>
export type TreatmentProcessor = Processor<TreatmentData, void>
