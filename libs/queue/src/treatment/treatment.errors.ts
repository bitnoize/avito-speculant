import { ErrorContext } from '@avito-speculant/common'
import { QueueError } from '../queue.errors.js'

export class UserSubscriptionLostError extends QueueError {
  constructor(context: ErrorContext, code = 123, message = `User subscription lost`) {
    super(context, code, message)
  }
}
