import { HighDatabaseError } from '../database.errors.js'

export class SubscriptionNotFoundError<T> extends HighDatabaseError<T> {
  constructor(request: T, statusCode = 404, message = `Subscription not found`) {
    super(request, statusCode, message)
  }
}

export class SubscriptionExistsError<T> extends HighDatabaseError<T> {
  constructor(request: T, statusCode = 403, message = `Subscription exists`) {
    super(request, statusCode, message)
  }
}

export class SubscriptionNotWaitError<T> extends HighDatabaseError<T> {
  constructor(request: T, statusCode = 403, message = `Subscription not wait`) {
    super(request, statusCode, message)
  }
}

export class SubscriptionNotActiveError<T> extends HighDatabaseError<T> {
  constructor(request: T, statusCode = 403, message = `Subscription not active`) {
    super(request, statusCode, message)
  }
}