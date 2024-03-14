import { JSONSchemaType } from '@avito-speculant/config'
import { Config } from './bot.js'

export const configSchema: JSONSchemaType<Config> = {
  type: 'object',
  required: ['BOT_TOKEN'],
  properties: {
    LOG_LEVEL: {
      type: 'string',
      nullable: true
    },
    POSTGRES_HOST: {
      type: 'string',
      nullable: true
    },
    POSTGRES_PORT: {
      type: 'number',
      nullable: true
    },
    POSTGRES_DATABASE: {
      type: 'string',
      nullable: true
    },
    POSTGRES_USERNAME: {
      type: 'string',
      nullable: true
    },
    POSTGRES_PASSWORD: {
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
    BOT_TOKEN: {
      type: 'string'
    }
  }
}
