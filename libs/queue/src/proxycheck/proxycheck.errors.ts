import { ErrorContext } from '@avito-speculant/common'
import { QueueError } from '../queue.errors.js'

export class OnlineProxiesUnavailableError extends QueueError {
  constructor(context: ErrorContext, code = 123, message = `Online proxies unavailable`) {
    super(context, code, message)
  }
}
