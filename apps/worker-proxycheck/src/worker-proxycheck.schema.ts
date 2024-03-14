import { JSONSchemaType } from '@avito-speculant/config'
import { Config } from './worker-proxycheck.js'

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
    PROXYCHECK_CONCURRENCY: {
      type: 'number',
      nullable: true
    },
    PROXYCHECK_LIMITER_MAX: {
      type: 'number',
      nullable: true
    },
    PROXYCHECK_LIMITER_DURATION: {
      type: 'number',
      nullable: true
    },
    PROXYCHECK_CHECK_URL: {
      type: 'string',
      nullable: true
    },
    PROXYCHECK_CHECK_TIMEOUT: {
      type: 'number',
      nullable: true
    }
  }
}
