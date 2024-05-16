import { JSONSchemaType } from '@avito-speculant/config'
import { DEFAULT_LOG_LEVEL } from '@avito-speculant/logger'
import {
  DEFAULT_REDIS_HOST,
  DEFAULT_REDIS_PORT,
  DEFAULT_REDIS_DATABASE
} from '@avito-speculant/redis'
import {
  DEFAULT_QUEUE_REDIS_HOST,
  DEFAULT_QUEUE_REDIS_PORT,
  DEFAULT_QUEUE_REDIS_DATABASE,
  DEFAULT_CHECKPROXY_CONCURRENCY,
  DEFAULT_CHECKPROXY_LIMITER_MAX,
  DEFAULT_CHECKPROXY_LIMITER_DURATION,
} from '@avito-speculant/queue'
import { Config } from './worker-checkproxy.js'

export const configSchema: JSONSchemaType<Config> = {
  type: 'object',
  required: [
    'LOG_LEVEL',
    'REDIS_HOST',
    'REDIS_PORT',
    'REDIS_DATABASE',
    'QUEUE_REDIS_HOST',
    'QUEUE_REDIS_PORT',
    'QUEUE_REDIS_DATABASE',
    'CHECKPROXY_CONCURRENCY',
    'CHECKPROXY_LIMITER_MAX',
    'CHECKPROXY_LIMITER_DURATION',
  ],
  properties: {
    LOG_LEVEL: {
      type: 'string',
      default: DEFAULT_LOG_LEVEL
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
    CHECKPROXY_CONCURRENCY: {
      type: 'integer',
      minimum: 1,
      maximum: 100,
      default: DEFAULT_CHECKPROXY_CONCURRENCY
    },
    CHECKPROXY_LIMITER_MAX: {
      type: 'integer',
      minimum: 1,
      maximum: 1000,
      default: DEFAULT_CHECKPROXY_LIMITER_MAX
    },
    CHECKPROXY_LIMITER_DURATION: {
      type: 'integer',
      minimum: 1000,
      maximum: 60000,
      default: DEFAULT_CHECKPROXY_LIMITER_DURATION
    },
  }
}