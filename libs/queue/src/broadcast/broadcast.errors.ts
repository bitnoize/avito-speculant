import { DomainError, ErrorContext } from '@avito-speculant/common'

export class BroadcastCategoryError extends DomainError {
  constructor(context: ErrorContext, code = 101, message = `Broadcast category error`) {
    super(context, code, message)
  }
}

export class BroadcastUserError extends DomainError {
  constructor(context: ErrorContext, code = 101, message = `Broadcast user error`) {
    super(context, code, message)
  }
}

export class BroadcastBotError extends DomainError {
  constructor(context: ErrorContext, code = 101, message = `Broadcast bot error`) {
    super(context, code, message)
  }
}
