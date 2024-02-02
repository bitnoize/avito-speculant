import { Type, type Static } from '@sinclair/typebox'
import { envSchema } from 'env-schema'

/**
 * Config validation schema
 */
export const configSchema = Type.Object({
  LOG_LEVEL: Type.Readonly(Type.String({ default: 'info' })),
  REDIS_HOST: Type.Readonly(Type.String()),
  REDIS_PORT: Type.Readonly(Type.Integer()),
  REDIS_DATABASE: Type.Readonly(Type.Integer()),
  REDIS_USERNAME: Type.ReadonlyOptional(Type.String()),
  REDIS_PASSWORD: Type.ReadonlyOptional(Type.String()),
  POSTGRES_HOST: Type.Readonly(Type.String()),
  POSTGRES_PORT: Type.Readonly(Type.Integer()),
  POSTGRES_DATABASE: Type.Readonly(Type.String()),
  POSTGRES_USERNAME: Type.ReadonlyOptional(Type.String()),
  POSTGRES_PASSWORD: Type.ReadonlyOptional(Type.String()),
  SCRAPER_CONCURRENCY: Type.Readonly(Type.Integer({ default: 10 })),
  SCRAPER_LIMITER_MAX: Type.Readonly(Type.Integer({ default: 100 })),
  SCRAPER_LIMITER_DURATION: Type.Readonly(Type.Integer({ default: 1_000 }))
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
