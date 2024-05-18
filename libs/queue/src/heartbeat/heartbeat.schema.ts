import { JSONSchemaType } from 'ajv'

export const configHeartbeatConcurrencySchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1,
  maximum: 1,
  default: 1
}

export const configHeartbeatLimiterMaxSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1,
  maximum: 10,
  default: 1
}

export const configHeartbeatLimiterDurationSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1_000,
  maximum: 60_000,
  default: 1_000
}

export const configHeartbeatFillingTreatmentSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 10,
  maximum: 1000,
  default: 100
}

export const configHeartbeatProduceUsersSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1,
  maximum: 100,
  default: 10
}

export const configHeartbeatProducePlansSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1,
  maximum: 10,
  default: 2
}

export const configHeartbeatProduceSubscriptionsSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1,
  maximum: 100,
  default: 10
}

export const configHeartbeatProduceBotsSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1,
  maximum: 100,
  default: 10
}

export const configHeartbeatProduceCategoriesSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1,
  maximum: 100,
  default: 10
}

export const configHeartbeatProduceProxiesSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1,
  maximum: 100,
  default: 10
}
