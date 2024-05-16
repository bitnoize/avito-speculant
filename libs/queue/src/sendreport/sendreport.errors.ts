import { ErrorContext } from '@avito-speculant/common'
import { QueueError } from '../queue.errors.js'

export class SendreportReportError extends QueueError {
  constructor(context: ErrorContext, code = 105, message = `Sendreport report error`) {
    super(context, code, message)
  }
}
