import { DomainError } from '@avito-speculant/common'

export class UserNotFoundError extends DomainError {
  constructor(context: unknown, statusCode = 101, message = `User not found`) {
    super(context, statusCode, message)
  }
}

export class UserNotPaidError extends DomainError {
  constructor(context: unknown, statusCode = 103, message = `User not paid`) {
    super(context, statusCode, message)
  }
}

export class UserBlockedError extends DomainError {
  constructor(context: unknown, statusCode = 103, message = `User is blocked`) {
    super(context, statusCode, message)
  }
}
