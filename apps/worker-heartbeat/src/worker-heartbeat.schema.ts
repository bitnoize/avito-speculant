import { JSONSchemaType } from '@avito-speculant/config'
import { DEFAULT_LOG_LEVEL } from '@avito-speculant/logger'
import {
  DEFAULT_POSTGRES_HOST,
  DEFAULT_POSTGRES_PORT,
  DEFAULT_POSTGRES_DATABASE,
  DEFAULT_POSTGRES_USERNAME
} from '@avito-speculant/database'
import {
  DEFAULT_REDIS_HOST,
  DEFAULT_REDIS_PORT,
  DEFAULT_REDIS_DATABASE
} from '@avito-speculant/redis'
import {
  DEFAULT_QUEUE_REDIS_HOST,
  DEFAULT_QUEUE_REDIS_PORT,
  DEFAULT_QUEUE_REDIS_DATABASE,
  DEFAULT_HEARTBEAT_CONCURRENCY,
  DEFAULT_HEARTBEAT_LIMITER_MAX,
  DEFAULT_HEARTBEAT_LIMITER_DURATION,
  DEFAULT_HEARTBEAT_FILLING_TREATMENT_MAX,
  DEFAULT_HEARTBEAT_PRODUCE_USERS_LIMIT,
  DEFAULT_HEARTBEAT_PRODUCE_PLANS_LIMIT,
  DEFAULT_HEARTBEAT_PRODUCE_SUBSCRIPTIONS_LIMIT,
  DEFAULT_HEARTBEAT_PRODUCE_CATEGORIES_LIMIT,
  DEFAULT_HEARTBEAT_PRODUCE_PROXIES_LIMIT
} from '@avito-speculant/queue'
import { Config } from './worker-heartbeat.js'

export const configSchema: JSONSchemaType<Config> = {
  type: 'object',
  required: [
    'LOG_LEVEL',
    'POSTGRES_HOST',
    'POSTGRES_PORT',
    'POSTGRES_DATABASE',
    'POSTGRES_USERNAME',
    'REDIS_HOST',
    'REDIS_PORT',
    'REDIS_DATABASE',
    'QUEUE_REDIS_HOST',
    'QUEUE_REDIS_PORT',
    'QUEUE_REDIS_DATABASE',
    'HEARTBEAT_CONCURRENCY',
    'HEARTBEAT_LIMITER_MAX',
    'HEARTBEAT_LIMITER_DURATION',
    'HEARTBEAT_FILLING_TREATMENT_MAX',
    'HEARTBEAT_PRODUCE_USERS_LIMIT',
    'HEARTBEAT_PRODUCE_PLANS_LIMIT',
    'HEARTBEAT_PRODUCE_SUBSCRIPTIONS_LIMIT',
    'HEARTBEAT_PRODUCE_CATEGORIES_LIMIT',
    'HEARTBEAT_PRODUCE_PROXIES_LIMIT'
  ],
  properties: {
    LOG_LEVEL: {
      type: 'string',
      default: DEFAULT_LOG_LEVEL
    },
    POSTGRES_HOST: {
      type: 'string',
      default: DEFAULT_POSTGRES_HOST
    },
    POSTGRES_PORT: {
      type: 'integer',
      minimum: 0,
      maximum: 65535,
      default: DEFAULT_POSTGRES_PORT
    },
    POSTGRES_DATABASE: {
      type: 'string',
      default: DEFAULT_POSTGRES_DATABASE
    },
    POSTGRES_USERNAME: {
      type: 'string',
      default: DEFAULT_POSTGRES_USERNAME
    },
    POSTGRES_PASSWORD: {
      type: 'string',
      nullable: true
    },
    REDIS_HOST: {
      type: 'string',
      default: DEFAULT_REDIS_HOST
    },
    REDIS_PORT: {
      type: 'integer',
      minimum: 0,
      maximum: 65535,
      default: DEFAULT_REDIS_PORT
    },
    REDIS_DATABASE: {
      type: 'integer',
      minimum: 0,
      maximum: 15,
      default: DEFAULT_REDIS_DATABASE
    },
    REDIS_USERNAME: {
      type: 'string',
      nullable: true
    },
    REDIS_PASSWORD: {
      type: 'string',
      nullable: true
    },
    QUEUE_REDIS_HOST: {
      type: 'string',
      default: DEFAULT_QUEUE_REDIS_HOST
    },
    QUEUE_REDIS_PORT: {
      type: 'integer',
      minimum: 0,
      maximum: 65535,
      default: DEFAULT_QUEUE_REDIS_PORT
    },
    QUEUE_REDIS_DATABASE: {
      type: 'integer',
      minimum: 0,
      maximum: 15,
      default: DEFAULT_QUEUE_REDIS_DATABASE
    },
    QUEUE_REDIS_USERNAME: {
      type: 'string',
      nullable: true
    },
    QUEUE_REDIS_PASSWORD: {
      type: 'string',
      nullable: true
    },
    HEARTBEAT_CONCURRENCY: {
      type: 'integer',
      minimum: 1,
      maximum: 100,
      default: DEFAULT_HEARTBEAT_CONCURRENCY
    },
    HEARTBEAT_LIMITER_MAX: {
      type: 'integer',
      minimum: 1,
      maximum: 1000,
      default: DEFAULT_HEARTBEAT_LIMITER_MAX
    },
    HEARTBEAT_LIMITER_DURATION: {
      type: 'integer',
      minimum: 1000,
      maximum: 60000,
      default: DEFAULT_HEARTBEAT_LIMITER_DURATION
    },
    HEARTBEAT_FILLING_TREATMENT_MAX: {
      type: 'integer',
      minimum: 10,
      maximum: 1000,
      default: DEFAULT_HEARTBEAT_FILLING_TREATMENT_MAX
    },
    HEARTBEAT_PRODUCE_USERS_LIMIT: {
      type: 'integer',
      minimum: 1,
      maximum: 100,
      default: DEFAULT_HEARTBEAT_PRODUCE_USERS_LIMIT
    },
    HEARTBEAT_PRODUCE_PLANS_LIMIT: {
      type: 'integer',
      minimum: 1,
      maximum: 10,
      default: DEFAULT_HEARTBEAT_PRODUCE_PLANS_LIMIT
    },
    HEARTBEAT_PRODUCE_SUBSCRIPTIONS_LIMIT: {
      type: 'integer',
      minimum: 1,
      maximum: 100,
      default: DEFAULT_HEARTBEAT_PRODUCE_SUBSCRIPTIONS_LIMIT
    },
    HEARTBEAT_PRODUCE_CATEGORIES_LIMIT: {
      type: 'integer',
      minimum: 1,
      maximum: 100,
      default: DEFAULT_HEARTBEAT_PRODUCE_CATEGORIES_LIMIT
    },
    HEARTBEAT_PRODUCE_PROXIES_LIMIT: {
      type: 'integer',
      minimum: 1,
      maximum: 100,
      default: DEFAULT_HEARTBEAT_PRODUCE_PROXIES_LIMIT
    }
  }
}
