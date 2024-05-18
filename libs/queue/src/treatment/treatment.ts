import { Queue, Job, Worker, Processor } from 'bullmq'
import { Entity } from '@avito-speculant/common'

export const TREATMENT_QUEUE_NAME = `treatment`

export type TreatmentConfig = {
  TREATMENT_CONCURRENCY: number
  TREATMENT_LIMITER_MAX: number
  TREATMENT_LIMITER_DURATION: number
}

export type TreatmentName = Entity

export type TreatmentData = {
  entityId: number
}

export type TreatmentResult = {
  durationTime: number
}

export type TreatmentQueue = Queue<TreatmentData, TreatmentResult, TreatmentName>
export type TreatmentJob = Job<TreatmentData, TreatmentResult, TreatmentName>
export type TreatmentWorker = Worker<TreatmentData, TreatmentResult, TreatmentName>
export type TreatmentProcessor = Processor<TreatmentData, TreatmentResult, TreatmentName>
