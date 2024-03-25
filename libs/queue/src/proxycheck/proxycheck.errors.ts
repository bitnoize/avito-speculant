import { QueueError } from '../queue.errors.js'

export class OnlineProxyUnavailableError extends QueueError {
  constructor(context: unknown, statusCode = 100, message = `Online proxy unavailable`) {
    super(context, statusCode, message)
  }
}
