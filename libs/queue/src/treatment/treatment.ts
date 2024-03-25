import { Queue, Job, Worker, Processor } from 'bullmq'
import { Entity } from '@avito-speculant/common'

export const TREATMENT_QUEUE_NAME = `treatment`

export const DEFAULT_TREATMENT_CONCURRENCY = 2
export const DEFAULT_TREATMENT_LIMITER_MAX = 2
export const DEFAULT_TREATMENT_LIMITER_DURATION = 1_000

export type TreatmentConfig = {
  TREATMENT_CONCURRENCY: number
  TREATMENT_LIMITER_MAX: number
  TREATMENT_LIMITER_DURATION: number
}

export type TreatmentName = Entity

export type TreatmentData = {
  entityId: number
}

export type TreatmentNameResult = { id: number }
export type TreatmentResult = Record<string, TreatmentNameResult>

export type TreatmentQueue = Queue<TreatmentData, TreatmentResult, TreatmentName>
export type TreatmentJob = Job<TreatmentData, TreatmentResult, TreatmentName>
export type TreatmentWorker = Worker<TreatmentData, TreatmentResult, TreatmentName>
export type TreatmentProcessor = Processor<TreatmentData, TreatmentResult, TreatmentName>
