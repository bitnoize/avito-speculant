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
  configQueueRedisHostSchema,
  configQueueRedisPortSchema,
  configQueueRedisDatabaseSchema,
  configQueueRedisUsernameSchema,
  configQueueRedisPasswordSchema,
  configHeartbeatConcurrencySchema,
  configHeartbeatLimiterMaxSchema,
  configHeartbeatLimiterDurationSchema,
  configHeartbeatFillingTreatmentSchema,
  configHeartbeatProduceUsersSchema,
  configHeartbeatProducePlansSchema,
  configHeartbeatProduceSubscriptionsSchema,
  configHeartbeatProduceBotsSchema,
  configHeartbeatProduceCategoriesSchema,
  configHeartbeatProduceProxiesSchema
} from '@avito-speculant/queue'
import { Config } from './worker-heartbeat.js'

export const configSchema: JSONSchemaType<Config> = {
  type: 'object',
  required: [
    'LOG_LEVEL',
    'POSTGRES_HOST',
    'POSTGRES_PORT',
    'POSTGRES_DATABASE',
    'POSTGRES_USERNAME',
    'QUEUE_REDIS_HOST',
    'QUEUE_REDIS_PORT',
    'QUEUE_REDIS_DATABASE',
    'QUEUE_REDIS_USERNAME',
    'HEARTBEAT_CONCURRENCY',
    'HEARTBEAT_LIMITER_MAX',
    'HEARTBEAT_LIMITER_DURATION',
    'HEARTBEAT_FILLING_TREATMENT',
    'HEARTBEAT_PRODUCE_USERS',
    'HEARTBEAT_PRODUCE_PLANS',
    'HEARTBEAT_PRODUCE_SUBSCRIPTIONS',
    'HEARTBEAT_PRODUCE_CATEGORIES',
    'HEARTBEAT_PRODUCE_BOTS',
    'HEARTBEAT_PRODUCE_PROXIES'
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
    QUEUE_REDIS_HOST: configQueueRedisHostSchema,
    QUEUE_REDIS_PORT: configQueueRedisPortSchema,
    QUEUE_REDIS_DATABASE: configQueueRedisDatabaseSchema,
    QUEUE_REDIS_USERNAME: configQueueRedisUsernameSchema,
    QUEUE_REDIS_PASSWORD: {
      ...configQueueRedisPasswordSchema,
      nullable: true
    },
    HEARTBEAT_CONCURRENCY: configHeartbeatConcurrencySchema,
    HEARTBEAT_LIMITER_MAX: configHeartbeatLimiterMaxSchema,
    HEARTBEAT_LIMITER_DURATION: configHeartbeatLimiterDurationSchema,
    HEARTBEAT_FILLING_TREATMENT: configHeartbeatFillingTreatmentSchema,
    HEARTBEAT_PRODUCE_USERS: configHeartbeatProduceUsersSchema,
    HEARTBEAT_PRODUCE_PLANS: configHeartbeatProducePlansSchema,
    HEARTBEAT_PRODUCE_SUBSCRIPTIONS: configHeartbeatProduceSubscriptionsSchema,
    HEARTBEAT_PRODUCE_BOTS: configHeartbeatProduceBotsSchema,
    HEARTBEAT_PRODUCE_CATEGORIES: configHeartbeatProduceCategoriesSchema,
    HEARTBEAT_PRODUCE_PROXIES: configHeartbeatProduceProxiesSchema
  }
}
