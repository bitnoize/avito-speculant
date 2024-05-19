import { DomainError, ErrorContext } from '@avito-speculant/common'

export class UserNotFoundError extends DomainError {
  constructor(context: ErrorContext, code = 101, message = `User not found`) {
    super(context, code, message)
  }
}
