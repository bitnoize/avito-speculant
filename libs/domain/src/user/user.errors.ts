import { DomainError } from '../domain.errors.js'

export class UserNotFoundError<T> extends DomainError<T> {
  constructor(request: T, statusCode = 404, message = `User not found`) {
    super(request, statusCode, message)
  }
}

export class UserNotPaidError<T> extends DomainError<T> {
  constructor(request: T, statusCode = 403, message = `User not paid`) {
    super(request, statusCode, message)
  }
}

export class UserBlockedError<T> extends DomainError<T> {
  constructor(request: T, statusCode = 403, message = `User blocked`) {
    super(request, statusCode, message)
  }
}