import { DatabaseError } from '../database.errors.js'

export class UserNotFoundError<T> extends DatabaseError<T> {
  constructor(request: T, statusCode = 404, message = `User not found`) {
    super(request, statusCode, message)
  }
}

export class UserBlockedError<T> extends DatabaseError<T> {
  constructor(request: T, statusCode = 403, message = `User blocked`) {
    super(request, statusCode, message)
  }
}
