import { Type, type Static } from '@sinclair/typebox'
import { envSchema } from 'env-schema'

/**
 * Config validation schema
 */
export const configSchema = Type.Object({
  LOG_LEVEL: Type.Readonly(Type.String({ default: 'info' })),
  BOT_TOKEN: Type.Readonly(Type.String()),
  POSTGRES_HOST: Type.Readonly(Type.String()),
  POSTGRES_PORT: Type.Readonly(Type.Integer()),
  POSTGRES_DATABASE: Type.Readonly(Type.String()),
  POSTGRES_USERNAME: Type.ReadonlyOptional(Type.String()),
  POSTGRES_PASSWORD: Type.ReadonlyOptional(Type.String())
})

/**
 * Config type alias
 */
export type Config = Static<typeof configSchema>

/**
 * Config instance
 */
export const config = envSchema<Config>({
  schema: configSchema
})

export default config
