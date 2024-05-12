import { ErrorContext } from '@avito-speculant/common'
import { RedisError } from '../redis.errors.js'

export class ProxyCacheNotFoundError extends RedisError {
  constructor(context: ErrorContext, code = 101, message = `ProxyCache not found`) {
    super(context, code, message)
  }
}

export class OnlineProxyCacheNotFoundError extends RedisError {
  constructor(context: ErrorContext, code = 101, message = `Online ProxyCache not found`) {
    super(context, code, message)
  }
}
