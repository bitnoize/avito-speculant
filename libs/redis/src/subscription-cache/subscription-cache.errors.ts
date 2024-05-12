import { ErrorContext } from '@avito-speculant/common'
import { RedisError } from '../redis.errors.js'

export class SubscriptionCacheNotFoundError extends RedisError {
  constructor(context: ErrorContext, code = 101, message = `SubscriptionCache not found`) {
    super(context, code, message)
  }
}
