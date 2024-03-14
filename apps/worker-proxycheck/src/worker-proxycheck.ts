import { LoggerConfig } from '@avito-speculant/logger'
import { RedisConfig } from '@avito-speculant/redis'
import { QueueConfig, ProxycheckConfig } from '@avito-speculant/queue'

export const DEFAULT_PROXYCHECK_CHECK_URL = 'https://www.google.com'
export const DEFAULT_PROXYCHECK_CHECK_TIMEOUT = 10_000

export type Config = LoggerConfig &
  RedisConfig &
  QueueConfig &
  ProxycheckConfig & {
    PROXYCHECK_CHECK_URL?: string
    PROXYCHECK_CHECK_TIMEOUT?: number
  }
