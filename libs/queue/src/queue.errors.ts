import { DomainError, ErrorContext } from '@avito-speculant/common'

export class QueueInternalError extends DomainError {
  constructor(context: ErrorContext, code = 100, message = `Queue internal error`) {
    super(context, code, message)
  }
}
