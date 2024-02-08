import { DatabaseError } from '../database.errors.js'

export class SubscriptionNotFoundError<T> extends DatabaseError<T> {
  constructor(request: T, message = `Subscription not found`, statusCode = 404) {
    super(request, message, statusCode)
  }
}
