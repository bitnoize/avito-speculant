export const DEFAULT_LOG_LEVEL =
  process.env.NODE_ENV === 'production' ? 'info' : 'debug'

export const DEFAULT_REDIS_HOST = 'localhost'
export const DEFAULT_REDIS_PORT = 6379
export const DEFAULT_REDIS_DATABASE = 0

export const DEFAULT_POSTGRES_HOST = 'localhost'
export const DEFAULT_POSTGRES_PORT = 5432
export const DEFAULT_POSTGRES_DATABASE = 'avito_speculant'
