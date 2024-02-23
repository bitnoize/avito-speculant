import {
  JSONSchemaType,
  DEFAULT_LOG_LEVEL,
  DEFAULT_REDIS_HOST,
  DEFAULT_REDIS_PORT,
  DEFAULT_REDIS_DATABASE,
  DEFAULT_POSTGRES_HOST,
  DEFAULT_POSTGRES_PORT,
  DEFAULT_POSTGRES_DATABASE
} from '@avito-speculant/config'
import { Config } from './worker-scraper.js'

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
    SCRAPER_CONCURRENCY: {
      type: 'number',
      default: 2
    },
    SCRAPER_LIMITER_MAX: {
      type: 'number',
      default: 60
    },
    SCRAPER_LIMITER_DURATION: {
      type: 'number',
      default: 60_000
    }
  }
}
