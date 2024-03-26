import { DomainError } from '@avito-speculant/common'

export abstract class QueueError extends DomainError {
  constructor(context: unknown, statusCode: number, message: string) {
    super(context, statusCode, message)
  }
}

export class ProcessorUnknownNameError extends QueueError {
  constructor(context: unknown, statusCode = 100, message = `Processor unknown name`) {
    super(context, statusCode, message)
  }
}

export class ProcessorUnknownStepError extends QueueError {
  constructor(context: unknown, statusCode = 100, message = `Processor unknown step`) {
    super(context, statusCode, message)
  }
}

export class LostRepeatableJobIdError extends QueueError {
  constructor(context: unknown, statusCode = 100, message = `Lost repeatable jobId`) {
    super(context, statusCode, message)
  }
}
