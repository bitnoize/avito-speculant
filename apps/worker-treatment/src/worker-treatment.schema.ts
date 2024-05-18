import { JSONSchemaType } from 'ajv'
import { configLogLevelSchema } from '@avito-speculant/logger'
import {
  configPostgresHostSchema,
  configPostgresPortSchema,
  configPostgresDatabaseSchema,
  configPostgresUsernameSchema,
  configPostgresPasswordSchema
} from '@avito-speculant/database'
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
  configTreatmentConcurrencySchema,
  configTreatmentLimiterMaxSchema,
  configTreatmentLimiterDurationSchema
} from '@avito-speculant/queue'
import { Config } from './worker-treatment.js'

export const configSchema: JSONSchemaType<Config> = {
  type: 'object',
  required: [
    'LOG_LEVEL',
    'POSTGRES_HOST',
    'POSTGRES_PORT',
    'POSTGRES_DATABASE',
    'POSTGRES_USERNAME',
    'REDIS_HOST',
    'REDIS_PORT',
    'REDIS_DATABASE',
    'REDIS_USERNAME',
    'QUEUE_REDIS_HOST',
    'QUEUE_REDIS_PORT',
    'QUEUE_REDIS_DATABASE',
    'QUEUE_REDIS_USERNAME',
    'TREATMENT_CONCURRENCY',
    'TREATMENT_LIMITER_MAX',
    'TREATMENT_LIMITER_DURATION'
  ],
  properties: {
    LOG_LEVEL: configLogLevelSchema,
    POSTGRES_HOST: configPostgresHostSchema,
    POSTGRES_PORT: configPostgresPortSchema,
    POSTGRES_DATABASE: configPostgresDatabaseSchema,
    POSTGRES_USERNAME: configPostgresUsernameSchema,
    POSTGRES_PASSWORD: {
      ...configPostgresPasswordSchema,
      nullable: true
    },
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
    TREATMENT_CONCURRENCY: configTreatmentConcurrencySchema,
    TREATMENT_LIMITER_MAX: configTreatmentLimiterMaxSchema,
    TREATMENT_LIMITER_DURATION: configTreatmentLimiterDurationSchema
  }
}
