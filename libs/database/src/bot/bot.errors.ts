import { ErrorContext } from '@avito-speculant/common'
import { DatabaseError } from '../database.errors.js'

export class BotNotFoundError extends DatabaseError {
  constructor(context: ErrorContext, code = 101, message = `Bot not found`) {
    super(context, code, message)
  }
}

export class BotExistsError extends DatabaseError {
  constructor(context: ErrorContext, code = 102, message = `Bot allready exists`) {
    super(context, code, message)
  }
}

export class BotIsLinkedError extends DatabaseError {
  constructor(context: ErrorContext, code = 104, message = `Bot is linked`) {
    super(context, code, message)
  }
}
