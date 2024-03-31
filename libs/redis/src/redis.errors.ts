import { DomainError, ErrorContext } from '@avito-speculant/common'

/*
 * Abstract class for redis level errors
 */
export abstract class RedisError extends DomainError {
  constructor(context: ErrorContext, code: number, message: string) {
    super(false, context, code, message)
  }
}

export class RedisParseError extends RedisError {
  constructor(context: ErrorContext, code = 100, message = `Redis parse error`) {
    super(context, code, message)
  }
}
