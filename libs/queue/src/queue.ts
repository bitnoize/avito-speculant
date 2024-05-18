export type QueueConfig = {
  QUEUE_REDIS_HOST: string
  QUEUE_REDIS_PORT: number
  QUEUE_REDIS_DATABASE: number
  QUEUE_REDIS_USERNAME: string
  QUEUE_REDIS_PASSWORD?: string
}

export type QueueSummary = {
  isPaused: boolean
  jobCounts: Record<string, number>
  workersCount: number
}
