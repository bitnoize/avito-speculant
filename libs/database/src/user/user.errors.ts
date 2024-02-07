import { DatabaseError } from '../database.errors.js'

export class UserNotFoundError<T> extends DatabaseError {
  constructor(request: T, message = `User Not Found`, statusCode = 404) {
    super(request, message, statusCode)
  }
}
