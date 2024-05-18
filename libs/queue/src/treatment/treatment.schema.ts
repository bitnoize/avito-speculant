import { JSONSchemaType } from 'ajv'

export const configTreatmentConcurrencySchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1,
  maximum: 100,
  default: 5
}

export const configTreatmentLimiterMaxSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1,
  maximum: 1000,
  default: 10
}

export const configTreatmentLimiterDurationSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1_000,
  maximum: 60_000,
  default: 1_000
}
