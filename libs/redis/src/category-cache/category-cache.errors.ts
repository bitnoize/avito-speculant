import { ErrorContext } from '@avito-speculant/common'
import { RedisError } from '../redis.errors.js'

export class CategoryCacheNotFoundError extends RedisError {
  constructor(context: ErrorContext, code = 101, message = `CategoryCache not found`) {
    super(context, code, message)
  }
}
