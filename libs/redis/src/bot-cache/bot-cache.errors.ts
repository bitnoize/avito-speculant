import { DomainError, ErrorContext } from '@avito-speculant/common'

export class BotCacheNotFoundError extends DomainError {
  constructor(context: ErrorContext, code = 101, message = `BotCache not found`) {
    super(context, code, message)
  }
}
