import { ErrorContext } from '@avito-speculant/common'
import { DatabaseError } from '../database.errors.js'

export class UserNotFoundError extends DatabaseError {
  constructor(context: ErrorContext, code = 101, message = `User not found`) {
    super(context, code, message)
  }
}
