import { ErrorContext } from '@avito-speculant/common'
import { QueueError } from '../queue.errors.js'

export class SendreportFoobarError extends QueueError {
  constructor(context: ErrorContext, code = 101, message = `Sendreport foobar error`) {
    super(context, code, message)
  }
}
