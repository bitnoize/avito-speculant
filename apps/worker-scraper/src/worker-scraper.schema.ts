import { JSONSchemaType } from '@avito-speculant/config'
import { DEFAULT_LOG_LEVEL } from '@avito-speculant/logger'
import {
  DEFAULT_REDIS_HOST,
  DEFAULT_REDIS_PORT,
  DEFAULT_REDIS_DATABASE
} from '@avito-speculant/redis'
import {
  DEFAULT_SCRAPER_CONCURRENCY,
  DEFAULT_SCRAPER_LIMITER_MAX,
  DEFAULT_SCRAPER_LIMITER_DURATION
} from '@avito-speculant/queue'
import { Config } from './worker-scraper.js'

export const configSchema: JSONSchemaType<Config> = {
  type: 'object',
  required: [
    'LOG_LEVEL',
    'REDIS_HOST',
    'REDIS_PORT',
    'REDIS_DATABASE',
    'SCRAPER_CONCURRENCY',
    'SCRAPER_LIMITER_MAX',
    'SCRAPER_LIMITER_DURATION'
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
    SCRAPER_CONCURRENCY: {
      type: 'number',
      default: DEFAULT_SCRAPER_CONCURRENCY
    },
    SCRAPER_LIMITER_MAX: {
      type: 'number',
      default: DEFAULT_SCRAPER_LIMITER_MAX
    },
    SCRAPER_LIMITER_DURATION: {
      type: 'number',
      default: DEFAULT_SCRAPER_LIMITER_DURATION
    }
  }
}
