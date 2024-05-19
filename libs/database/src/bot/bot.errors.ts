import { DomainError, ErrorContext } from '@avito-speculant/common'

export class BotNotFoundError extends DomainError {
  constructor(context: ErrorContext, code = 101, message = `Bot not found`) {
    super(context, code, message)
  }
}

export class BotExistsError extends DomainError {
  constructor(context: ErrorContext, code = 102, message = `Bot allready exists`) {
    super(context, code, message)
  }
}

export class BotIsLinkedError extends DomainError {
  constructor(context: ErrorContext, code = 104, message = `Bot is linked`) {
    super(context, code, message)
  }
}

export class BotNotLinkedError extends DomainError {
  constructor(context: ErrorContext, code = 104, message = `Bot not linked`) {
    super(context, code, message)
  }
}

export class BotIsEnabledError extends DomainError {
  constructor(context: ErrorContext, code = 105, message = `Bot is enabled`) {
    super(context, code, message)
  }
}
export class BotIsDisabledError extends DomainError {
  constructor(context: ErrorContext, code = 105, message = `Bot is disabled`) {
    super(context, code, message)
  }
}
