import { LoggerConfig, Logger } from '@avito-speculant/logger'
import { DatabaseConfig } from '@avito-speculant/database'
import {
  QueueConfig,
  HeartbeatConfig,
  HeartbeatResult,
  HeartbeatJob
} from '@avito-speculant/queue'

export type Config = LoggerConfig & DatabaseConfig & QueueConfig & HeartbeatConfig

export type ProcessStep = (
  config: Config,
  logger: Logger,
  heartbeatJob: HeartbeatJob,
  heartbeatResult: HeartbeatResult,
) => Promise<void>
