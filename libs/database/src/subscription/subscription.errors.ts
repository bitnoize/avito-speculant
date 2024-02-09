import { DatabaseError } from '../database.errors.js'

export class SubscriptionNotFoundError<T> extends DatabaseError<T> {
  constructor(request: T, statusCode = 404, message = `Subscription not found`) {
    super(request, statusCode, message)
  }
}
