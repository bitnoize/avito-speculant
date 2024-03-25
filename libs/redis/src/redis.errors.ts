import { DomainError } from '@avito-speculant/common'

export abstract class RedisError extends DomainError {
  constructor(context: unknown, statusCode: number, message: string) {
    super(context, statusCode, message)
  }
}

export class RedisInternalError extends RedisError {
  constructor(context: unknown, statusCode = 100, message = `Redis internal error`) {
    super(context, statusCode, message)
  }
}
