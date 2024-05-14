import { ErrorContext } from '@avito-speculant/common'
import { RedisError } from '../redis.errors.js'

export class AdvertCacheNotFoundError extends RedisError {
  constructor(context: ErrorContext, code = 101, message = `AdvertCache not found`) {
    super(context, code, message)
  }
}
