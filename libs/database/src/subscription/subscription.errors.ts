import { DomainError, ErrorContext } from '@avito-speculant/common'

export class SubscriptionNotFoundError extends DomainError {
  constructor(context: ErrorContext, code = 101, message = `Subscription not found`) {
    super(context, code, message)
  }
}

export class SubscriptionExistsError extends DomainError {
  constructor(context: ErrorContext, code = 106, message = `Subscription allready exists`) {
    super(context, code, message)
  }
}

export class SubscriptionNotWaitError extends DomainError {
  constructor(context: ErrorContext, code = 103, message = `Subscription not wait status`) {
    super(context, code, message)
  }
}

export class SubscriptionNotActiveError extends DomainError {
  constructor(context: ErrorContext, code = 103, message = `Subscription not active status`) {
    super(context, code, message)
  }
}

export class SubscriptionIsCancelError extends DomainError {
  constructor(context: ErrorContext, code = 103, message = `Subscription is cancel status`) {
    super(context, code, message)
  }
}

export class SubscriptionIsActiveError extends DomainError {
  constructor(context: ErrorContext, code = 103, message = `Subscription is active status`) {
    super(context, code, message)
  }
}
