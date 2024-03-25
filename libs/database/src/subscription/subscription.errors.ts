import { DomainError } from '@avito-speculant/common'

export class SubscriptionNotFoundError extends DomainError {
  constructor(context: unknown, statusCode = 101, message = `Subscription not found`) {
    super(context, statusCode, message)
  }
}

export class SubscriptionExistsError extends DomainError {
  constructor(context: unknown, statusCode = 103, message = `Subscription exists`) {
    super(context, statusCode, message)
  }
}

export class SubscriptionNotWaitError extends DomainError {
  constructor(context: unknown, statusCode = 103, message = `Subscription not wait`) {
    super(context, statusCode, message)
  }
}

export class SubscriptionNotActiveError extends DomainError {
  constructor(context: unknown, statusCode = 103, message = `Subscription not active`) {
    super(context, statusCode, message)
  }
}
