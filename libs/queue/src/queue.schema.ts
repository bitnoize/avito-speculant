import { JSONSchemaType } from 'ajv'

export const configQueueRedisHostSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  default: 'localhost'
}

export const configQueueRedisPortSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 0,
  maximum: 65535,
  default: 6379
}

export const configQueueRedisDatabaseSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 0,
  maximum: 15,
  default: 1
}

export const configQueueRedisUsernameSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  default: 'default'
}

export const configQueueRedisPasswordSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1
}
