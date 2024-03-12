import { LoggerConfig } from '@avito-speculant/logger'
import { DatabaseConfig } from '@avito-speculant/database'
import { RedisConfig } from '@avito-speculant/redis'
import { HeartbeatConfig } from '@avito-speculant/queue'

export const DEFAULT_HEARTBEAT_QUEUE_USERS_LIMIT = 10
export const DEFAULT_HEARTBEAT_QUEUE_PLANS_LIMIT = 1
export const DEFAULT_HEARTBEAT_QUEUE_SUBSCRIPTIONS_LIMIT = 10
export const DEFAULT_HEARTBEAT_QUEUE_CATEGORIES_LIMIT = 10
export const DEFAULT_HEARTBEAT_QUEUE_PROXIES_LIMIT = 10

export type Config = LoggerConfig & DatabaseConfig & RedisConfig & HeartbeatConfig & {
  HEARTBEAT_QUEUE_USERS_LIMIT: number
  HEARTBEAT_QUEUE_PLANS_LIMIT: number
  HEARTBEAT_QUEUE_SUBSCRIPTIONS_LIMIT: number
  HEARTBEAT_QUEUE_CATEGORIES_LIMIT: number
  HEARTBEAT_QUEUE_PROXIES_LIMIT: number
}
