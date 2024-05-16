import { ErrorContext } from '@avito-speculant/common'
import { QueueError } from '../queue.errors.js'

export class BroadcastCategoryError extends QueueError {
  constructor(context: ErrorContext, code = 101, message = `Broadcast category error`) {
    super(context, code, message)
  }
}

export class BroadcastUserError extends QueueError {
  constructor(context: ErrorContext, code = 101, message = `Broadcast user error`) {
    super(context, code, message)
  }
}

export class BroadcastBotError extends QueueError {
  constructor(context: ErrorContext, code = 101, message = `Broadcast bot error`) {
    super(context, code, message)
  }
}
