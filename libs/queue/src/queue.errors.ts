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

export class LostRepeatableJobError extends QueueError {
  constructor(context: ErrorContext, code = 100, message = `Lost repeatable job`) {
    super(context, code, message)
  }
}
