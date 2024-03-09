import { JSONSchemaType } from '@avito-speculant/config'
import { DEFAULT_LOG_LEVEL } from '@avito-speculant/logger'
import {
  DEFAULT_POSTGRES_HOST,
  DEFAULT_POSTGRES_PORT,
  DEFAULT_POSTGRES_DATABASE
} from '@avito-speculant/database'
import {
  DEFAULT_REDIS_HOST,
  DEFAULT_REDIS_PORT,
  DEFAULT_REDIS_DATABASE,
} from '@avito-speculant/redis'
import { Config } from './worker-business.js'

export const configSchema: JSONSchemaType<Config> = {
  type: 'object',
  required: [
    'LOG_LEVEL',
    'REDIS_HOST',
    'REDIS_PORT',
    'REDIS_DATABASE',
    'POSTGRES_HOST',
    'POSTGRES_PORT',
    'POSTGRES_DATABASE',
    'BUSINESS_CONCURRENCY',
    'BUSINESS_LIMITER_MAX',
    'BUSINESS_LIMITER_DURATION',
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
    POSTGRES_HOST: {
      type: 'string',
      default: DEFAULT_POSTGRES_HOST
    },
    POSTGRES_PORT: {
      type: 'number',
      default: DEFAULT_POSTGRES_PORT
    },
    POSTGRES_DATABASE: {
      type: 'string',
      default: DEFAULT_POSTGRES_DATABASE
    },
    POSTGRES_USERNAME: {
      type: 'string',
      nullable: true
    },
    POSTGRES_PASSWORD: {
      type: 'string',
      nullable: true
    },
    BUSINESS_CONCURRENCY: {
      type: 'number',
      default: 2
    },
    BUSINESS_LIMITER_MAX: {
      type: 'number',
      default: 10
    },
    BUSINESS_LIMITER_DURATION: {
      type: 'number',
      default: 60_000
    }
  }
}
