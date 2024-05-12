import { ErrorContext } from '@avito-speculant/common'
import { DatabaseError } from '../database.errors.js'

export class SubscriptionNotFoundError extends DatabaseError {
  constructor(context: ErrorContext, code = 101, message = `Subscription not found`) {
    super(context, code, message)
  }
}

export class SubscriptionExistsError extends DatabaseError {
  constructor(context: ErrorContext, code = 106, message = `Subscription allready exists`) {
    super(context, code, message)
  }
}

export class SubscriptionNotWaitError extends DatabaseError {
  constructor(context: ErrorContext, code = 103, message = `Subscription not wait status`) {
    super(context, code, message)
  }
}

export class SubscriptionNotActiveError extends DatabaseError {
  constructor(context: ErrorContext, code = 103, message = `Subscription not active status`) {
    super(context, code, message)
  }
}

export class SubscriptionIsCancelError extends DatabaseError {
  constructor(context: ErrorContext, code = 103, message = `Subscription is cancel status`) {
    super(context, code, message)
  }
}

export class SubscriptionIsActiveError extends DatabaseError {
  constructor(context: ErrorContext, code = 103, message = `Subscription is active status`) {
    super(context, code, message)
  }
}
