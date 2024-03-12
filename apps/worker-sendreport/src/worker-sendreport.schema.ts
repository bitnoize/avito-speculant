import { JSONSchemaType } from '@avito-speculant/config'
import { DEFAULT_LOG_LEVEL } from '@avito-speculant/logger'
import {
  DEFAULT_REDIS_HOST,
  DEFAULT_REDIS_PORT,
  DEFAULT_REDIS_DATABASE
} from '@avito-speculant/redis'
import {
  DEFAULT_SENDREPORT_CONCURRENCY,
  DEFAULT_SENDREPORT_LIMITER_MAX,
  DEFAULT_SENDREPORT_LIMITER_DURATION
} from '@avito-speculant/queue'
import { Config } from './worker-sendreport.js'

export const configSchema: JSONSchemaType<Config> = {
  type: 'object',
  required: [
    'LOG_LEVEL',
    'REDIS_HOST',
    'REDIS_PORT',
    'REDIS_DATABASE',
    'SENDREPORT_CONCURRENCY',
    'SENDREPORT_LIMITER_MAX',
    'SENDREPORT_LIMITER_DURATION',
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
      type: 'number',
      default: DEFAULT_REDIS_PORT
    },
    REDIS_DATABASE: {
      type: 'number',
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
    SENDREPORT_CONCURRENCY: {
      type: 'number',
      default: DEFAULT_SENDREPORT_CONCURRENCY
    },
    SENDREPORT_LIMITER_MAX: {
      type: 'number',
      default: DEFAULT_SENDREPORT_LIMITER_MAX
    },
    SENDREPORT_LIMITER_DURATION: {
      type: 'number',
      default: DEFAULT_SENDREPORT_LIMITER_DURATION
    },
    BOT_TOKEN: {
      type: 'string'
    }
  }
}
