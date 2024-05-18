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
  configCheckproxyConcurrencySchema,
  configCheckproxyLimiterMaxSchema,
  configCheckproxyLimiterDurationSchema
} from '@avito-speculant/queue'
import { Config } from './worker-checkproxy.js'

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
    'CHECKPROXY_CONCURRENCY',
    'CHECKPROXY_LIMITER_MAX',
    'CHECKPROXY_LIMITER_DURATION'
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
    CHECKPROXY_CONCURRENCY: configCheckproxyConcurrencySchema,
    CHECKPROXY_LIMITER_MAX: configCheckproxyLimiterMaxSchema,
    CHECKPROXY_LIMITER_DURATION: configCheckproxyLimiterDurationSchema
  }
}
