import { DomainError } from '../domain.errors.js'

export class SubscriptionNotFoundError<T> extends DomainError<T> {
  constructor(request: T, statusCode = 404, message = `Subscription not found`) {
    super(request, statusCode, message)
  }
}
