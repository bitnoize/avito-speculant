import { DomainError, ErrorContext } from '@avito-speculant/common'

export class DatabaseInternalError extends DomainError {
  constructor(context: ErrorContext, code = 100, message = `Database internal error`) {
    super(context, code, message)
  }
}
