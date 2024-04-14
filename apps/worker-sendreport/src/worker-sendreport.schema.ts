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
  DEFAULT_SENDREPORT_CONCURRENCY,
  DEFAULT_SENDREPORT_LIMITER_MAX,
  DEFAULT_SENDREPORT_LIMITER_DURATION,
  DEFAULT_SENDREPORT_ATTEMPTS_LIMIT
} from '@avito-speculant/queue'
import { Config } from './worker-sendreport.js'

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
    'SENDREPORT_CONCURRENCY',
    'SENDREPORT_LIMITER_MAX',
    'SENDREPORT_LIMITER_DURATION',
    'SENDREPORT_ATTEMPTS_LIMIT',
    'BOT_TOKEN'
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
    SENDREPORT_CONCURRENCY: {
      type: 'integer',
      minimum: 1,
      maximum: 100,
      default: DEFAULT_SENDREPORT_CONCURRENCY
    },
    SENDREPORT_LIMITER_MAX: {
      type: 'integer',
      minimum: 1,
      maximum: 1000,
      default: DEFAULT_SENDREPORT_LIMITER_MAX
    },
    SENDREPORT_LIMITER_DURATION: {
      type: 'integer',
      minimum: 1000,
      maximum: 60000,
      default: DEFAULT_SENDREPORT_LIMITER_DURATION
    },
    SENDREPORT_ATTEMPTS_LIMIT: {
      type: 'integer',
      minimum: 1,
      maximum: 100,
      default: DEFAULT_SENDREPORT_ATTEMPTS_LIMIT
    },
    BOT_TOKEN: {
      type: 'string'
    }
  }
}
