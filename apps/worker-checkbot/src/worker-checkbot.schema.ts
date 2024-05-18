import { JSONSchemaType } from 'ajv'
import { configLogLevelSchema } from '@avito-speculant/logger'
import {
  configRedisHostSchema,
  configRedisPortSchema,
  configRedisDatabaseSchema,
  configRedisUsernameSchema,
  configRedisPasswordSchema
} from '@avito-speculant/redis'
import {
  configQueueRedisHostSchema,
  configQueueRedisPortSchema,
  configQueueRedisDatabaseSchema,
  configQueueRedisUsernameSchema,
  configQueueRedisPasswordSchema,
  configCheckbotConcurrencySchema,
  configCheckbotLimiterMaxSchema,
  configCheckbotLimiterDurationSchema
} from '@avito-speculant/queue'
import { Config } from './worker-checkbot.js'

export const configSchema: JSONSchemaType<Config> = {
  type: 'object',
  required: [
    'LOG_LEVEL',
    'REDIS_HOST',
    'REDIS_PORT',
    'REDIS_DATABASE',
    'REDIS_USERNAME',
    'QUEUE_REDIS_HOST',
    'QUEUE_REDIS_PORT',
    'QUEUE_REDIS_DATABASE',
    'QUEUE_REDIS_USERNAME',
    'CHECKBOT_CONCURRENCY',
    'CHECKBOT_LIMITER_MAX',
    'CHECKBOT_LIMITER_DURATION'
  ],
  properties: {
    LOG_LEVEL: configLogLevelSchema,
    REDIS_HOST: configRedisHostSchema,
    REDIS_PORT: configRedisPortSchema,
    REDIS_DATABASE: configRedisDatabaseSchema,
    REDIS_USERNAME: configRedisUsernameSchema,
    REDIS_PASSWORD: {
      ...configRedisPasswordSchema,
      nullable: true
    },
    QUEUE_REDIS_HOST: configQueueRedisHostSchema,
    QUEUE_REDIS_PORT: configQueueRedisPortSchema,
    QUEUE_REDIS_DATABASE: configQueueRedisDatabaseSchema,
    QUEUE_REDIS_USERNAME: configQueueRedisUsernameSchema,
    QUEUE_REDIS_PASSWORD: {
      ...configQueueRedisPasswordSchema,
      nullable: true
    },
    CHECKBOT_CONCURRENCY: configCheckbotConcurrencySchema,
    CHECKBOT_LIMITER_MAX: configCheckbotLimiterMaxSchema,
    CHECKBOT_LIMITER_DURATION: configCheckbotLimiterDurationSchema
  }
}
