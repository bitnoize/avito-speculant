import { ErrorContext } from '@avito-speculant/common'
import { QueueError } from '../queue.errors.js'

export class TreatmentOverflowError extends QueueError {
  constructor(context: ErrorContext, code = 101, message = `Treatment queue overflow`) {
    super(context, code, message)
  }
}
