import { JSONSchemaType } from 'ajv'

export const configCheckproxyConcurrencySchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1,
  maximum: 100,
  default: 5
}

export const configCheckproxyLimiterMaxSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1,
  maximum: 1000,
  default: 10
}

export const configCheckproxyLimiterDurationSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1_000,
  maximum: 60_000,
  default: 1_000
}
