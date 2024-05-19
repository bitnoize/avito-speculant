import { DomainError, ErrorContext } from '@avito-speculant/common'

export class CheckbotOverflowError extends DomainError {
  constructor(context: ErrorContext, code = 101, message = `Checkbot queue overflow`) {
    super(context, code, message)
  }
}
