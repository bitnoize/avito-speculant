import { ErrorContext } from '@avito-speculant/common'
import { RedisError } from '../redis.errors.js'

export class UserCacheNotFoundError extends RedisError {
  constructor(context: ErrorContext, code = 101, message = `UserCache not found`) {
    super(context, code, message)
  }
}
