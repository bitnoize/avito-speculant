import { DomainError, ErrorContext } from '@avito-speculant/common'

export class ProcessorUnknownNameError extends DomainError {
  constructor(context: ErrorContext, code = 100, message = `Processor unknown name`) {
    super(true, context, code, message)
  }
}

export class ProcessorUnknownStepError extends DomainError {
  constructor(context: ErrorContext, code = 100, message = `Processor unknown step`) {
    super(true, context, code, message)
  }
}

/*
 * Abstract class for queue level errors
 */
export abstract class QueueError extends DomainError {
  constructor(context: ErrorContext, code: number, message: string) {
    super(false, context, code, message)
  }
}

export class QueueJobLostTokenError extends QueueError {
  constructor(context: ErrorContext, code = 100, message = `Queue job lost token`) {
    super(context, code, message)
  }
}

export class QueueJobLostIdError extends QueueError {
  constructor(context: ErrorContext, code = 100, message = `Queue job lost id`) {
    super(context, code, message)
  }
}

export class UserSubscriptionBreakError extends QueueError {
  constructor(context: ErrorContext, code = 123, message = `User subscription break`) {
    super(context, code, message)
  }
}

export class OnlineProxiesUnavailableError extends QueueError {
  constructor(context: ErrorContext, code = 123, message = `Online proxies unavailable`) {
    super(context, code, message)
  }
}
