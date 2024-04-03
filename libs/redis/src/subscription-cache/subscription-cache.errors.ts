import { ErrorContext } from '@avito-speculant/common'
import { RedisError } from '../redis.errors.js'

export class UserSubscriptionError extends RedisError {
  constructor(context: ErrorContext, code = 150, message = `User subscription malformed`) {
    super(context, code, message)
  }
}
