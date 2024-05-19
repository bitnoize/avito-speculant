import { DomainError, ErrorContext } from '@avito-speculant/common'

export class TreatmentOverflowError extends DomainError {
  constructor(context: ErrorContext, code = 101, message = `Treatment queue overflow`) {
    super(context, code, message)
  }
}
