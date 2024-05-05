import { DomainError, ErrorContext } from '@avito-speculant/common'

/*
 * Abstract class for redis level errors
 */
export abstract class RedisError extends DomainError {
  constructor(context: ErrorContext, code: number, message: string) {
    super(context, code, message)
  }
}

export class RedisInternalError extends RedisError {
  constructor(context: ErrorContext, code = 100, message = `Redis internal error`) {
    super(context, code, message)
  }
}
