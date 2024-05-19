import { DomainError, ErrorContext } from '@avito-speculant/common'

export class UserCacheNotFoundError extends DomainError {
  constructor(context: ErrorContext, code = 101, message = `UserCache not found`) {
    super(context, code, message)
  }
}
