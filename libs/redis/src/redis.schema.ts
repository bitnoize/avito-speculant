import { JSONSchemaType } from 'ajv'

export const configRedisHostSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  default: 'localhost'
}

export const configRedisPortSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 0,
  maximum: 65535,
  default: 6379
}

export const configRedisDatabaseSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 0,
  maximum: 15,
  default: 0
}

export const configRedisUsernameSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  default: 'default'
}

export const configRedisPasswordSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1
}
