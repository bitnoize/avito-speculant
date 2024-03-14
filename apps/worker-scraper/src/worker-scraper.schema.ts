import { JSONSchemaType } from '@avito-speculant/config'
import { Config } from './worker-scraper.js'

export const configSchema: JSONSchemaType<Config> = {
  type: 'object',
  required: [],
  properties: {
    LOG_LEVEL: {
      type: 'string',
      nullable: true
    },
    REDIS_HOST: {
      type: 'string',
      nullable: true
    },
    REDIS_PORT: {
      type: 'number',
      nullable: true
    },
    REDIS_DATABASE: {
      type: 'number',
      nullable: true
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
      nullable: true
    },
    QUEUE_REDIS_PORT: {
      type: 'number',
      nullable: true
    },
    QUEUE_REDIS_DATABASE: {
      type: 'number',
      nullable: true
    },
    QUEUE_REDIS_USERNAME: {
      type: 'string',
      nullable: true
    },
    QUEUE_REDIS_PASSWORD: {
      type: 'string',
      nullable: true
    },
    SCRAPER_CONCURRENCY: {
      type: 'number',
      nullable: true
    },
    SCRAPER_LIMITER_MAX: {
      type: 'number',
      nullable: true
    },
    SCRAPER_LIMITER_DURATION: {
      type: 'number',
      nullable: true
    }
  }
}
