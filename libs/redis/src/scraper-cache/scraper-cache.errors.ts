import { ErrorContext } from '@avito-speculant/common'
import { RedisError } from '../redis.errors.js'

export class ScraperCacheNotFoundError extends RedisError {
  constructor(context: ErrorContext, code = 101, message = `ScraperCache not found`) {
    super(context, code, message)
  }
}
