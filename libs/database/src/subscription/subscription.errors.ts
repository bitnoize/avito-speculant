import { ErrorContext } from '@avito-speculant/common'
import { DatabaseError } from '../database.errors.js'

export class SubscriptionNotFoundError extends DatabaseError {
  constructor(context: ErrorContext, code = 101, message = `Subscription not found`) {
    super(context, code, message)
  }
}

export class SubscriptionExistsError extends DatabaseError {
  constructor(context: ErrorContext, code = 103, message = `Subscription exists`) {
    super(context, code, message)
  }
}

export class SubscriptionNotWaitError extends DatabaseError {
  constructor(context: ErrorContext, code = 103, message = `Subscription not wait`) {
    super(context, code, message)
  }
}

export class SubscriptionNotActiveError extends DatabaseError {
  constructor(context: ErrorContext, code = 103, message = `Subscription not active`) {
    super(context, code, message)
  }
}
