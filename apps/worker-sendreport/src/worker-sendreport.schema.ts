import { JSONSchemaType } from '@avito-speculant/config'
import { Config } from './worker-sendreport.js'

export const configSchema: JSONSchemaType<Config> = {
  type: 'object',
  required: ['BOT_TOKEN'],
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
    SENDREPORT_CONCURRENCY: {
      type: 'number',
      nullable: true
    },
    SENDREPORT_LIMITER_MAX: {
      type: 'number',
      nullable: true
    },
    SENDREPORT_LIMITER_DURATION: {
      type: 'number',
      nullable: true
    },
    BOT_TOKEN: {
      type: 'string'
    }
  }
}
