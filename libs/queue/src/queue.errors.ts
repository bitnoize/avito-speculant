import { DomainError } from '@avito-speculant/common'

export abstract class QueueError extends DomainError {
  constructor(context: unknown, statusCode: number, message: string) {
    super(context, statusCode, message)
  }
}

export class ProcessUnknownNameError extends QueueError {
  constructor(context: unknown, statusCode = 100, message = `Process unknown name`) {
    super(context, statusCode, message)
  }
}

export class ProcessUnknownStepError extends QueueError {
  constructor(context: unknown, statusCode = 100, message = `Process unknown step`) {
    super(context, statusCode, message)
  }
}
