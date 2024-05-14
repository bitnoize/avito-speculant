import { ErrorContext } from '@avito-speculant/common'
import { RedisError } from '../redis.errors.js'

export class ReportCacheNotFoundError extends RedisError {
  constructor(context: ErrorContext, code = 101, message = `ReportCache not found`) {
    super(context, code, message)
  }
}
