import { ErrorContext } from '@avito-speculant/common'
import { RedisError } from '../redis.errors.js'

export class PlanCacheNotFoundError extends RedisError {
  constructor(context: ErrorContext, code = 101, message = `PlanCache not found`) {
    super(context, code, message)
  }
}
