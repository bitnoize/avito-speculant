import { JSONSchemaType } from '@avito-speculant/config'
import { DEFAULT_LOG_LEVEL } from '@avito-speculant/logger'
import {
  DEFAULT_REDIS_HOST,
  DEFAULT_REDIS_PORT,
  DEFAULT_REDIS_DATABASE
} from '@avito-speculant/redis'
import {
  DEFAULT_PROXYCHECK_CONCURRENCY,
  DEFAULT_PROXYCHECK_LIMITER_MAX,
  DEFAULT_PROXYCHECK_LIMITER_DURATION
} from '@avito-speculant/queue'
import {
  DEFAULT_PROXYCHECK_CHECK_URL,
  DEFAULT_PROXYCHECK_CHECK_TIMEOUT,
  Config
} from './worker-proxycheck.js'

export const configSchema: JSONSchemaType<Config> = {
  type: 'object',
  required: [
    'LOG_LEVEL',
    'REDIS_HOST',
    'REDIS_PORT',
    'REDIS_DATABASE',
    'PROXYCHECK_CONCURRENCY',
    'PROXYCHECK_LIMITER_MAX',
    'PROXYCHECK_LIMITER_DURATION',
    'PROXYCHECK_CHECK_URL',
    'PROXYCHECK_CHECK_TIMEOUT'
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
    PROXYCHECK_CONCURRENCY: {
      type: 'number',
      default: DEFAULT_PROXYCHECK_CONCURRENCY
    },
    PROXYCHECK_LIMITER_MAX: {
      type: 'number',
      default: DEFAULT_PROXYCHECK_LIMITER_MAX
    },
    PROXYCHECK_LIMITER_DURATION: {
      type: 'number',
      default: DEFAULT_PROXYCHECK_LIMITER_DURATION
    },
    PROXYCHECK_CHECK_URL: {
      type: 'string',
      default: DEFAULT_PROXYCHECK_CHECK_URL
    },
    PROXYCHECK_CHECK_TIMEOUT: {
      type: 'number',
      default: DEFAULT_PROXYCHECK_CHECK_TIMEOUT
    }
  }
}
