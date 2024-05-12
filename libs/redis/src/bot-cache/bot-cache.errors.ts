import { ErrorContext } from '@avito-speculant/common'
import { RedisError } from '../redis.errors.js'

export class BotCacheNotFoundError extends RedisError {
  constructor(context: ErrorContext, code = 101, message = `BotCache not found`) {
    super(context, code, message)
  }
}
