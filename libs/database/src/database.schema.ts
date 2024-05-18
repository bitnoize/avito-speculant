import { JSONSchemaType } from 'ajv'

export const configPostgresHostSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  default: 'localhost'
}

export const configPostgresPortSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 0,
  maximum: 65535,
  default: 5432
}

export const configPostgresDatabaseSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  default: 'avito_speculant'
}

export const configPostgresUsernameSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  default: 'avito_speculant'
}

export const configPostgresPasswordSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1
}
