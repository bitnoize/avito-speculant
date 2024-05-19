import { DomainError, ErrorContext } from '@avito-speculant/common'

export class CheckproxyOverflowError extends DomainError {
  constructor(context: ErrorContext, code = 101, message = `Checkproxy queue overflow`) {
    super(context, code, message)
  }
}
