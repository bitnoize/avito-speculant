export const DEFAULT_QUEUE_REDIS_HOST = 'localhost'
export const DEFAULT_QUEUE_REDIS_PORT = 6379
export const DEFAULT_QUEUE_REDIS_DATABASE = 1

export type QueueConfig = {
  QUEUE_REDIS_HOST?: string
  QUEUE_REDIS_PORT?: number
  QUEUE_REDIS_DATABASE?: number
  QUEUE_REDIS_USERNAME?: string
  QUEUE_REDIS_PASSWORD?: string
}
