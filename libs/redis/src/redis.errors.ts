import { DomainError, ErrorContext } from '@avito-speculant/common'

export class RedisInternalError extends DomainError {
  constructor(context: ErrorContext, code = 100, message = `Redis internal error`) {
    super(context, code, message)
  }
}
