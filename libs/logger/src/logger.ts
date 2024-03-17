export const DEFAULT_LOG_LEVEL = process.env.NODE_ENV === 'production' ? 'info' : 'debug'

export type LoggerConfig = {
  LOG_LEVEL: string
}
