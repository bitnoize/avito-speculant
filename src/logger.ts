import { pino, LoggerOptions, Logger } from 'pino'
import { Config } from './config.js'

export { Logger } from 'pino'

/*
 * Get LoggerOptions from config
 */
export function getLoggerOptions(config: Config): LoggerOptions {
  const loggerOptions: LoggerOptions = {
    level: config.LOG_LEVEL
  }

  return loggerOptions
}

/**
 * Initialize Logger instance
 */
export function initLogger(options: LoggerOptions): Logger {
  const logger = pino(options)

  logger.debug(`Logger initialized with '${logger.level}' level`)

  return logger
}
