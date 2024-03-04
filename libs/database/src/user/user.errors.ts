import { HighDatabaseError } from '../database.errors.js'

export class UserNotFoundError<T> extends HighDatabaseError<T> {
  constructor(request: T, statusCode = 404, message = `User not found`) {
    super(request, statusCode, message)
  }
}

export class UserNotPaidError<T> extends HighDatabaseError<T> {
  constructor(request: T, statusCode = 403, message = `User not paid`) {
    super(request, statusCode, message)
  }
}

export class UserBlockedError<T> extends HighDatabaseError<T> {
  constructor(request: T, statusCode = 403, message = `User is blocked`) {
    super(request, statusCode, message)
  }
}
