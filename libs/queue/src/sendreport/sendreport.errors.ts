import { DomainError, ErrorContext } from '@avito-speculant/common'

export class SendreportReportError extends DomainError {
  constructor(context: ErrorContext, code = 105, message = `Sendreport report error`) {
    super(context, code, message)
  }
}
