import { ErrorContext } from '@avito-speculant/common'
import { QueueError } from '../queue.errors.js'

export class CheckbotOverflowError extends QueueError {
  constructor(context: ErrorContext, code = 101, message = `Checkbot queue overflow`) {
    super(context, code, message)
  }
}
