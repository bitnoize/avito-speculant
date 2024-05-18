import { JSONSchemaType } from 'ajv'

export const configLogLevelSchema: JSONSchemaType<string> = {
  type: 'string',
  default: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
}
