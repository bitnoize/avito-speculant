import { envSchema, JSONSchemaType } from 'env-schema'

export function initConfig<T>(schema: JSONSchemaType<T>): T {
  return envSchema({ schema })
}
