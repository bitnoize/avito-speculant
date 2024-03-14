import { LoggerConfig } from '@avito-speculant/logger'
import { DatabaseConfig } from '@avito-speculant/database'
import { RedisConfig } from '@avito-speculant/redis'
import { QueueConfig, HeartbeatConfig } from '@avito-speculant/queue'

export type Config = LoggerConfig &
  DatabaseConfig &
  RedisConfig &
  QueueConfig &
  HeartbeatConfig & {
    HEARTBEAT_PRODUCE_USERS_LIMIT?: number
    HEARTBEAT_PRODUCE_PLANS_LIMIT?: number
    HEARTBEAT_PRODUCE_SUBSCRIPTIONS_LIMIT?: number
    HEARTBEAT_PRODUCE_CATEGORIES_LIMIT?: number
    HEARTBEAT_PRODUCE_PROXIES_LIMIT?: number
  }
